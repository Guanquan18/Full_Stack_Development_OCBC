// Created By: Sairam (S10259930H)
const sql = require("mssql");
const dbConfig = require("../configs/dbConfig");

class Transaction {
    constructor(TransactNo, TransactDate, TransactAmount, AccSender, SenderName, AccReceiver, ReceiverName, TransactType) {
        this.TransactNo = TransactNo;
        this.TransactDate = TransactDate;
        this.TransactAmount = TransactAmount;
        this.AccSender = AccSender;
        this.SenderName = SenderName;
        this.AccReceiver = AccReceiver;
        this.ReceiverName = ReceiverName;
        this.TransactType = TransactType;
    }

    // Method to retrieve existing recipients for a profile (kesh)
    static async getRecipients(profileId) {
        const connection = await sql.connect(dbConfig);
        try {
            const query = `
                SELECT 
                    r.RecipientId, 
                    r.RecipientName, 
                    r.BankName, 
                    r.AccNum, 
                    a.CurrencyCode
                FROM 
                    Recipient r
                INNER JOIN 
                    Account a
                ON 
                    r.AccNum = a.AccNum
                WHERE 
                    r.ProfileId = @ProfileId
            `;
    
            const result = await connection.request()
                .input("ProfileId", sql.SmallInt, profileId)
                .query(query);
    
            return result.recordset; // Return the fetched data
        } catch (error) {
            console.error("Error retrieving recipients:", error);
            throw error; // Propagate the error
        } finally {
            connection.close(); // Ensure the connection is closed
        }
    }
    

    // Method to add a new recipient (kesh)
    static async addRecipient(profileId, recipientName, bankName, accNum) {
        const connection = await sql.connect(dbConfig);
        try {
            // Check if accNum exists in Account table
            const accountCheckQuery = `
                SELECT COUNT(*) AS count FROM Account 
                WHERE AccNum = @AccNum
            `;
            const accountCheckRequest = connection.request();
            accountCheckRequest.input("AccNum", sql.VarChar(20), accNum);
            const accountCheckResult = await accountCheckRequest.query(accountCheckQuery);

            // If accNum does not exist, throw an error
            if (accountCheckResult.recordset[0].count === 0) {
                throw new Error("Account number does not exist.");
            }

            // Check if recipient already exists for this profile and account number
            const checkQuery = `
                SELECT COUNT(*) AS count FROM Recipient 
                WHERE ProfileId = @ProfileId AND AccNum = @AccNum
            `;
            const checkRequest = connection.request();
            checkRequest.input("ProfileId", sql.SmallInt, profileId);
            checkRequest.input("AccNum", sql.VarChar(20), accNum);
            const checkResult = await checkRequest.query(checkQuery);

            // If recipient exists, throw an error
            if (checkResult.recordset[0].count > 0) {
                throw new Error("Recipient already exists.");
            }

            // Proceed with inserting the new recipient
            const insertQuery = `
                INSERT INTO Recipient (RecipientName, BankName, AccNum, ProfileId)
                VALUES (@RecipientName, @BankName, @AccNum, @ProfileId)
            `;
            const insertRequest = connection.request();
            insertRequest.input("ProfileId", sql.SmallInt, profileId);
            insertRequest.input("RecipientName", sql.VarChar(25), recipientName);
            insertRequest.input("BankName", sql.VarChar(50), bankName);
            insertRequest.input("AccNum", sql.VarChar(20), accNum);
            await insertRequest.query(insertQuery);

            // Fetch the newly added recipient with CurrencyCode
            const selectQuery = `
                SELECT 
                    r.RecipientId,
                    r.RecipientName,
                    r.BankName,
                    r.AccNum,
                    a.CurrencyCode
                FROM 
                    Recipient r
                INNER JOIN 
                    Account a ON r.AccNum = a.AccNum
                WHERE 
                    r.ProfileId = @ProfileId AND r.AccNum = @AccNum
            `;
            const selectRequest = connection.request();
            selectRequest.input("ProfileId", sql.SmallInt, profileId);
            selectRequest.input("AccNum", sql.VarChar(20), accNum);
            const result = await selectRequest.query(selectQuery);

            return {
                message: "Recipient added successfully",
                recipient: result.recordset[0] // Return the newly added recipient's details
            };
        } catch (error) {
            console.error("Error adding recipient:", error);
            if (error.message === "Recipient already exists.") {
                return { error: "Recipient already exists with this profile and account number." };
            }
            if (error.message === "Account number does not exist.") {
                return { error: "The specified account number does not exist." };
            }
            throw error;
        } finally {
            connection.close();
        }
    }

    // Method to perform a transfer to the recipient (kesh)
    static async performTransfer(accSender, accReceiver, amount) {
        const connection = await sql.connect(dbConfig);
        let transaction; // Declare transaction outside the try block
        try {
            transaction = new sql.Transaction(connection);
            await transaction.begin();
    
            // Check sender's balance
            const senderBalanceQuery = `
                SELECT Balance FROM Account WHERE AccNum = @AccSender
            `;
            const senderBalanceResult = await transaction.request()
                .input("AccSender", sql.VarChar(20), accSender)
                .query(senderBalanceQuery);
            const senderBalance = senderBalanceResult.recordset[0]?.Balance;
    
            if (senderBalance < amount) {
                throw new Error("Insufficient balance for transfer.");
            }
    
            // Deduct amount from sender's account
            const deductQuery = `
                UPDATE Account
                SET Balance = Balance - @Amount
                WHERE AccNum = @AccSender
            `;
            await transaction.request()
                .input("Amount", sql.Float, amount)
                .input("AccSender", sql.VarChar(20), accSender)
                .query(deductQuery);
    
            // Add amount to receiver's account
            const addQuery = `
                UPDATE Account
                SET Balance = Balance + @Amount
                WHERE AccNum = @AccReceiver
            `;
            await transaction.request()
                .input("Amount", sql.Float, amount)
                .input("AccReceiver", sql.VarChar(20), accReceiver)
                .query(addQuery);
    
            // Create transaction record with TransactDate as the current date
            const transactionQuery = `
                INSERT INTO BankTransaction (TransactDate, TransactAmount, AccSender, AccReceiver)
                VALUES (@TransactDate, @Amount, @AccSender, @AccReceiver)
            `;
            await transaction.request()
                .input("TransactDate", sql.DateTime, new Date())  // Set the current date
                .input("Amount", sql.Float, amount)
                .input("AccSender", sql.VarChar(20), accSender)
                .input("AccReceiver", sql.VarChar(20), accReceiver)
                .query(transactionQuery);
    
            await transaction.commit();
            return { message: "Transfer successful" };
        } catch (error) {
            console.error("Error performing transfer:", error);
            if (transaction) { // Check if transaction is defined before rolling back
                await transaction.rollback();
            }
            throw error;
        } finally {
            connection.close();
        }
    }
    
    
    

    // Static method to fetch transaction history based on account number and time range -- Sairam
    static async getTransactionHistory(accNum, rangeOption, startDate, endDate) {
        const connection = await sql.connect(dbConfig); // Connect to the database

        try {
            let calculatedStartDate;
            let calculatedEndDate = new Date(); // Set to today's date

            // Calculate start date based on range option
            if (rangeOption === '1month') {
                calculatedStartDate = new Date();
                calculatedStartDate.setMonth(calculatedStartDate.getMonth() - 1);
            } else if (rangeOption === '3months') {
                calculatedStartDate = new Date();
                calculatedStartDate.setMonth(calculatedStartDate.getMonth() - 3);
            } else if (rangeOption === 'custom') {
                if (!startDate || !endDate) {
                    throw new Error('Start date and end date are required for a custom range.');
                }
                calculatedStartDate = new Date(startDate);
                calculatedEndDate = new Date(endDate);
            } else {
                throw new Error('Invalid range option.');
            }

            // SQL query to fetch transactions based on account number and calculated date range
            const sqlQuery = `
            SELECT 
                bt.TransactNo, 
                FORMAT(bt.TransactDate, 'dd MMMM yyyy') AS TransactDate,
                bt.TransactAmount, 
                bt.AccSender, 
                senderProfile.FullName AS SenderName, 
                bt.AccReceiver, 
                receiverProfile.FullName AS ReceiverName,
                bt.BillerAccNum, 
                biller.BillerName AS BillerName,
                bt.TransactType
            FROM BankTransaction bt
            LEFT JOIN Account sender ON bt.AccSender = sender.AccNum
            LEFT JOIN Profile senderProfile ON sender.ProfileId = senderProfile.ProfileId
            LEFT JOIN Account receiver ON bt.AccReceiver = receiver.AccNum
            LEFT JOIN Profile receiverProfile ON receiver.ProfileId = receiverProfile.ProfileId
            LEFT JOIN Biller biller ON bt.BillerAccNum = biller.BillerAccNum
            WHERE (bt.AccSender = @AccNum OR bt.AccReceiver = @AccNum OR bt.BillerAccNum IS NOT NULL)
            AND bt.TransactDate BETWEEN @StartDate AND @EndDate
            ORDER BY bt.TransactDate DESC, bt.TransactNo DESC;`; // Parameterized query

            const request = connection.request();
            request.input("AccNum", accNum);
            request.input("StartDate", calculatedStartDate);
            request.input("EndDate", calculatedEndDate);

            const result = await request.query(sqlQuery);

            // Check if any records were found
            if (result.recordset.length === 0) {
                return [];
            }

            // Map the results to Transaction objects
            const transactions = result.recordset.map(row => new Transaction(
                row.TransactNo,
                row.TransactDate,
                row.TransactAmount,
                row.AccSender,
                row.AccSender === accNum ? "You" : row.SenderName,
                row.AccReceiver || row.BillerAccNum, // Handle both receiver and biller
                row.AccReceiver === accNum ? "You" : row.ReceiverName || row.BillerName,
                row.TransactType
            ));
            
            return transactions; // Return the array of Transaction objects
        } catch (error) {
            console.error("Error retrieving transaction history:", error);
            throw error;
        } finally {
            connection.close();
        }
    }
    // Static method to fetch transaction history based on account number and time range -- Sairam
    static async performForeignExchange(accSender, accReceiver, exchangeRate, amount) {
        const connection = await sql.connect(dbConfig);
        let transaction;
        try {
            transaction = new sql.Transaction(connection);
            await transaction.begin();
    
            // Retrieve sender's currency code
            const senderCurrencyQuery = `
                SELECT CurrencyCode, Balance FROM Account WHERE AccNum = @AccSender
            `;
            const senderCurrencyResult = await transaction.request()
                .input("AccSender", sql.VarChar(20), accSender)
                .query(senderCurrencyQuery);
            const fromCurrency = senderCurrencyResult.recordset[0]?.CurrencyCode;
            const senderBalance = senderCurrencyResult.recordset[0]?.Balance;

            if (senderBalance < amount) {
                throw new Error("Insufficient balance for foreign exchange.");
            }
    
            // Retrieve receiver's currency code
            const receiverCurrencyQuery = `
                SELECT CurrencyCode FROM Account WHERE AccNum = @AccReceiver
            `;
            const receiverCurrencyResult = await transaction.request()
                .input("AccReceiver", sql.VarChar(20), accReceiver)
                .query(receiverCurrencyQuery);
            const toCurrency = receiverCurrencyResult.recordset[0]?.CurrencyCode;
    
            if (!fromCurrency || !toCurrency) {
                throw new Error("Invalid sender or receiver account.");
            }
    
            // Deduct the amount from sender's account
            const deductQuery = `
                UPDATE Account
                SET Balance = Balance - @Amount
                WHERE AccNum = @AccSender
            `;
            await transaction.request()
                .input("Amount", sql.Float, amount)
                .input("AccSender", sql.VarChar(20), accSender)
                .query(deductQuery);
    
            // Calculate converted amount
            const convertedAmount = amount * exchangeRate;
    
            // Add the converted amount to receiver's account
            const addQuery = `
                UPDATE Account
                SET Balance = Balance + @ConvertedAmount
                WHERE AccNum = @AccReceiver
            `;
            await transaction.request()
                .input("ConvertedAmount", sql.Float, convertedAmount)
                .input("AccReceiver", sql.VarChar(20), accReceiver)
                .query(addQuery);
    
            // Insert into BankTransaction
            const transactionQuery = `
                INSERT INTO BankTransaction (TransactAmount, AccSender, AccReceiver, TransactType)
                OUTPUT inserted.TransactNo
                VALUES (@Amount, @AccSender, @AccReceiver, 'Foreign Exchange')
            `;
            const transactionResult = await transaction.request()
                .input("Amount", sql.Float, amount)
                .input("AccSender", sql.VarChar(20), accSender)
                .input("AccReceiver", sql.VarChar(20), accReceiver)
                .query(transactionQuery);
    
            const transactNo = transactionResult.recordset[0].TransactNo;
    
            // Insert into ForeignExchangeTransaction
            const foreignExchangeQuery = `
                INSERT INTO ForeignExchangeTransaction (TransactNo, FromCurrency, ToCurrency, ExchangeRate, ConvertedAmount)
                VALUES (@TransactNo, @FromCurrency, @ToCurrency, @ExchangeRate, @ConvertedAmount)
            `;
            await transaction.request()
                .input("TransactNo", sql.Int, transactNo)
                .input("FromCurrency", sql.VarChar(3), fromCurrency)
                .input("ToCurrency", sql.VarChar(3), toCurrency)
                .input("ExchangeRate", sql.Float, exchangeRate)
                .input("ConvertedAmount", sql.Float, convertedAmount)
                .query(foreignExchangeQuery);
    
            await transaction.commit();
            return { message: "Foreign exchange successful", transactNo };
        } catch (error) {
            console.error("Error performing foreign exchange:", error);
            if (transaction) await transaction.rollback();
            throw error;
        } finally {
            connection.close();
        }
    }
    

    // Method to fetch expenses based on profile id
    static async getExpenses(profileId) {
        const connection = await sql.connect(dbConfig);
        try {
            const query = `

                SELECT 
                    bt.TransactNo, 
                    FORMAT(bt.TransactDate, 'dd-MMMM-yyyy') AS TransactDate,
                    bt.TransactAmount, 
                    bt.AccSender, 
                    senderProfile.FullName AS SenderName, 
                    bt.AccReceiver, 
                    receiverProfile.FullName AS ReceiverName,
                    bt.TransactPurpose,
                    bt.BillerAccNum,
                    biller.BillerName AS BillerName
                FROM BankTransaction bt
                LEFT JOIN Account sender ON bt.AccSender = sender.AccNum
                LEFT JOIN Profile senderProfile ON sender.ProfileId = senderProfile.ProfileId
                LEFT JOIN Account receiver ON bt.AccReceiver = receiver.AccNum
                LEFT JOIN Profile receiverProfile ON receiver.ProfileId = receiverProfile.ProfileId
                LEFT JOIN Biller biller ON bt.BillerAccNum = biller.BillerAccNum
                WHERE (senderProfile.ProfileId = @ProfileId or bt.BillerAccNum IS NOT NULL)
                ORDER BY bt.TransactDate DESC;
            `;
            
            const request  = connection.request();
            request.input("ProfileId", sql.SmallInt, profileId);
            const result = await request.query(query);
            
            // Check if any records were found
            if (result.recordset.length === 0) {
                return [];
            }

            // Map the results to Transaction objects
            const expenses = result.recordset.map(row => new Transaction(
                row.TransactNo,
                row.TransactDate,
                row.TransactAmount,
                row.AccSender,
                row.SenderName,
                row.AccReceiver || row.BillerAccNum, // Handle both receiver and biller
                row.ReceiverName || row.BillerName,
                row.TransactPurpose
            ));

            return expenses; // Return the array of Transaction objects

        } catch (error) {
            console.error("Error fetching expenses:", error);
            throw error;
        } finally {
            connection.close();
        }
    }

    // Method to fetch expenses based on profile id
    static async getExpenses(profileId) {
        const connection = await sql.connect(dbConfig);
        try {
            const query = `

                SELECT 
                    bt.TransactNo, 
                    FORMAT(bt.TransactDate, 'dd-MMMM-yyyy') AS TransactDate,
                    bt.TransactAmount, 
                    bt.AccSender, 
                    senderProfile.FullName AS SenderName, 
                    bt.AccReceiver, 
                    receiverProfile.FullName AS ReceiverName,
                    bt.TransactPurpose,
                    bt.BillerAccNum,
                    biller.BillerName AS BillerName
                FROM BankTransaction bt
                LEFT JOIN Account sender ON bt.AccSender = sender.AccNum
                LEFT JOIN Profile senderProfile ON sender.ProfileId = senderProfile.ProfileId
                LEFT JOIN Account receiver ON bt.AccReceiver = receiver.AccNum
                LEFT JOIN Profile receiverProfile ON receiver.ProfileId = receiverProfile.ProfileId
                LEFT JOIN Biller biller ON bt.BillerAccNum = biller.BillerAccNum
                WHERE (senderProfile.ProfileId = @ProfileId or bt.BillerAccNum IS NOT NULL)
                ORDER BY bt.TransactDate DESC;
            `;
            
            const request  = connection.request();
            request.input("ProfileId", sql.SmallInt, profileId);
            const result = await request.query(query);
            
            // Check if any records were found
            if (result.recordset.length === 0) {
                return [];
            }

            // Map the results to Transaction objects
            const expenses = result.recordset.map(row => new Transaction(
                row.TransactNo,
                row.TransactDate,
                row.TransactAmount,
                row.AccSender,
                row.SenderName,
                row.AccReceiver || row.BillerAccNum, // Handle both receiver and biller
                row.ReceiverName || row.BillerName,
                row.TransactPurpose
            ));

            return expenses; // Return the array of Transaction objects

        } catch (error) {
            console.error("Error fetching expenses:", error);
            throw error;
        } finally {
            connection.close();
        }
    }

    // Method to fetch expenses based on profile id
    static async getExpenses(profileId) {
        const connection = await sql.connect(dbConfig);
        try {
            const query = `

                SELECT 
                    bt.TransactNo, 
                    FORMAT(bt.TransactDate, 'dd-MMMM-yyyy') AS TransactDate,
                    bt.TransactAmount, 
                    bt.AccSender, 
                    senderProfile.FullName AS SenderName, 
                    bt.AccReceiver, 
                    receiverProfile.FullName AS ReceiverName,
                    bt.TransactPurpose,
                    bt.BillerAccNum,
                    biller.BillerName AS BillerName
                FROM BankTransaction bt
                LEFT JOIN Account sender ON bt.AccSender = sender.AccNum
                LEFT JOIN Profile senderProfile ON sender.ProfileId = senderProfile.ProfileId
                LEFT JOIN Account receiver ON bt.AccReceiver = receiver.AccNum
                LEFT JOIN Profile receiverProfile ON receiver.ProfileId = receiverProfile.ProfileId
                LEFT JOIN Biller biller ON bt.BillerAccNum = biller.BillerAccNum
                WHERE (senderProfile.ProfileId = @ProfileId or bt.BillerAccNum IS NOT NULL)
                ORDER BY bt.TransactDate DESC;
            `;
            
            const request  = connection.request();
            request.input("ProfileId", sql.SmallInt, profileId);
            const result = await request.query(query);
            
            // Check if any records were found
            if (result.recordset.length === 0) {
                return [];
            }

            // Map the results to Transaction objects
            const expenses = result.recordset.map(row => new Transaction(
                row.TransactNo,
                row.TransactDate,
                row.TransactAmount,
                row.AccSender,
                row.SenderName,
                row.AccReceiver || row.BillerAccNum, // Handle both receiver and biller
                row.ReceiverName || row.BillerName,
                row.TransactPurpose
            ));

            return expenses; // Return the array of Transaction objects

        } catch (error) {
            console.error("Error fetching expenses:", error);
            throw error;
        } finally {
            connection.close();
        }
    }
}

module.exports = Transaction;