/*--------------------- Start Below Here ---------------------*/

IF NOT EXISTS (SELECT name FROM master.dbo.sysdatabases WHERE name = 'OCBC_DB')
BEGIN
    CREATE DATABASE OCBC_DB;
    PRINT 'Database OCBC_DB created successfully.';
END
ELSE
BEGIN
    PRINT 'Database OCBC_DB already exists.';
    USE OCBC_DB;
    IF OBJECT_ID('Budget', 'U') IS NOT NULL DROP TABLE Budget;
    IF OBJECT_ID('RewardsHistory', 'U') IS NOT NULL DROP TABLE RewardsHistory;
    IF OBJECT_ID('ForumMessages', 'U') IS NOT NULL DROP TABLE ForumMessages;
    IF OBJECT_ID('ForumCategory', 'U') IS NOT NULL DROP TABLE ForumCategory;
	IF OBJECT_ID('ForeignExchangeTransaction', 'U') IS NOT NULL DROP TABLE ForeignExchangeTransaction;
	IF OBJECT_ID('Bills', 'U') IS NOT NULL DROP TABLE Bills;
	IF OBJECT_ID('BankTransaction', 'U') IS NOT NULL DROP TABLE BankTransaction;
	IF OBJECT_ID('Biller', 'U') IS NOT NULL DROP TABLE Biller;
    IF OBJECT_ID('Recipient', 'U') IS NOT NULL DROP TABLE Recipient;
    IF OBJECT_ID('Card', 'U') IS NOT NULL DROP TABLE Card;
    IF OBJECT_ID('Account', 'U') IS NOT NULL DROP TABLE Account;
    IF OBJECT_ID('Profile', 'U') IS NOT NULL DROP TABLE Profile;
    PRINT 'Existing tables dropped successfully.';
END
GO

/*--------------------- Don't touch anything above ---------------------*/

/*--------------------- If you need to reset database, just run the whole file. :) ---------------------*/

use OCBC_DB
go


--Profile Table
create table Profile
(
	ProfileId	smallint identity(1,1)	not null,
	FullName	varchar(25)				not null,
	AccessCode	char(7)					not null unique,
	PinHash		varchar(100)			not null,
	constraint PK_Profile primary key (ProfileId)
)

--Account Table
create table Account
(
	AccNum		varchar(20)		not null,
	AccType     varchar(30)     not null,
	Balance		float			not null,
	ProfileId	smallint		not null,
	CurrencyCode   VARCHAR(3)   NOT NULL DEFAULT 'SGD',
	constraint PK_Account primary key (AccNum),
	constraint FK_Account_ProfileId foreign key (ProfileId)
		references Profile (ProfileId)
)


--Card Table
create table Card
(
	CardNum			char(19)	not null,
	CardName		varchar(25)	not null,
	CardType		varchar(10) not null,
	DateOfExpiry	date		not null,
	CVV				char(3)		not null,
	AccNum			varchar(20)	not null,
	constraint PK_Card primary key (CardNum),
	constraint FK_Card_AccNum foreign key (AccNum)
		references Account (AccNum)
);

--Recipient Table
create table Recipient (
    RecipientId     smallint identity(1,1) not null,
    RecipientName   varchar(25)            not null,
    BankName        varchar(50)            not null,
    AccNum          varchar(20)            not null,
    ProfileId       smallint               not null,
    constraint PK_Recipient primary key (RecipientId),
    constraint FK_Recipient_ProfileId foreign key (ProfileId)
        references Profile (ProfileId)
)
--Biller Table
CREATE TABLE Biller (
    BillerID       INT           IDENTITY(1,1) NOT NULL,
    BillerName     VARCHAR(50)   NOT NULL,
    BillerAccNum   VARCHAR(20)   NOT NULL,
    BankName       VARCHAR(50)   NOT NULL,
    Category       VARCHAR(30)   NOT NULL,  -- e.g., 'Utilities', 'Telecom', 'Insurance'
    CreatedDate    DATETIME      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Biller PRIMARY KEY (BillerID),
    CONSTRAINT UQ_BillerAccNum UNIQUE (BillerAccNum)  -- Unique constraint for foreign key reference
);


-- Bills Table
CREATE TABLE Bills (
    BillID         INT           IDENTITY(1,1) NOT NULL,
    BillerID       INT           NOT NULL,              
    ProfileID      SMALLINT      NOT NULL,              
    BillAmount     FLOAT         NOT NULL,              
    DueDate        DATETIME      NOT NULL,              
    Status         VARCHAR(20)   NOT NULL DEFAULT 'Unpaid', -- e.g., 'Unpaid', 'Paid', 'Overdue'
    CreatedDate    DATETIME      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Bills PRIMARY KEY (BillID),
    CONSTRAINT FK_Bills_BillerID FOREIGN KEY (BillerID) REFERENCES Biller (BillerID),
    CONSTRAINT FK_Bills_ProfileID FOREIGN KEY (ProfileID) REFERENCES Profile (ProfileID)
);

-- Transaction Table
CREATE TABLE BankTransaction
(
    TransactNo      INT IDENTITY(1,1) NOT NULL,
    TransactDate    DATE NOT NULL DEFAULT GETDATE(),
    TransactAmount  FLOAT NOT NULL,
    AccSender       VARCHAR(20),
    AccReceiver     VARCHAR(20),  -- For normal transfers
    BillerAccNum    VARCHAR(20),  -- For bill payments
	TransactPurpose	VARCHAR(100)	DEFAULT ('Uncategorised')	NULL CHECK(TransactPurpose in ('Grocery or Retail Purchases',
																					   'ATM Withdrawals or Cash Deposits',
																					   'Online Shopping',
																					   'Medical or Healthcare Payments',
																					   'ATM Withdrawals or Cash Deposits',
																					   'Uncategorised',
																					   'Others',
																					   'Bank Reward Claim')),
	TransactType VARCHAR(20) NOT NULL DEFAULT 'Local Transfer',
    CONSTRAINT PK_BankTransaction PRIMARY KEY (TransactNo),
    CONSTRAINT FK_BankTransaction_AccSender FOREIGN KEY (AccSender)
        REFERENCES Account (AccNum),
    CONSTRAINT FK_BankTransaction_AccReceiver FOREIGN KEY (AccReceiver)
        REFERENCES Account (AccNum),
    CONSTRAINT FK_BankTransaction_BillerAccNum FOREIGN KEY (BillerAccNum)
        REFERENCES Biller (BillerAccNum)
);

CREATE TABLE ForeignExchangeTransaction (
    ExchangeID      INT IDENTITY(1,1) NOT NULL,  
    TransactNo      INT NOT NULL,               
    FromCurrency    VARCHAR(3) NOT NULL,        
    ToCurrency      VARCHAR(3) NOT NULL,        
    ExchangeRate    FLOAT NOT NULL,             
    ConvertedAmount FLOAT NOT NULL,             
    CONSTRAINT PK_ForeignExchangeTransaction PRIMARY KEY (ExchangeID),
    CONSTRAINT FK_ForeignExchangeTransaction_TransactNo FOREIGN KEY (TransactNo)
        REFERENCES BankTransaction (TransactNo)
);

--Forum Category table to create cateogries within the forum with unique IDs
CREATE TABLE ForumCategory (
    CategoryID INT IDENTITY(1,1) NOT NULL,
    CategoryName NVARCHAR(255) NOT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_ForumCategory PRIMARY KEY (CategoryID)
);

--Create table to include messages into the forum categories
CREATE TABLE ForumMessages (
    MessageID INT IDENTITY(1,1) NOT NULL,
    CategoryID INT NOT NULL,
    SenderName NVARCHAR(255) NOT NULL,
    MessageContent NVARCHAR(MAX) NOT NULL,
    PostedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_ForumMessages PRIMARY KEY (MessageID),
    CONSTRAINT FK_ForumMessages_CategoryID FOREIGN KEY (CategoryID)
        REFERENCES ForumCategory (CategoryID)
);

--Create table for reward system
CREATE TABLE RewardsHistory (
    RewardsHistoryId    INT IDENTITY(1,1)   NOT NULL,
    RewardDescription   NVARCHAR(255)       NOT NULL,
    RewardType          NVARCHAR(255)       NOT NULL CHECK(RewardType IN ('Points', 'Vouchers', 'Discounts', 'Cashback')),
    RewardAmount        FLOAT               NOT NULL,
    RewardDate          DATETIME            NOT NULL DEFAULT GETDATE(),
    AccNum              VARCHAR(20)		    NOT NULL,
    CONSTRAINT PK_RewardsHistory PRIMARY KEY (RewardsHistoryId),
    CONSTRAINT FK_RewardsHistory_AccNum FOREIGN KEY (AccNum)
        REFERENCES Account (AccNum)
);

--Create table for Budget
CREATE TABLE Budget (
    BudgetID        INT IDENTITY(1,1)   NOT NULL,
    BudgetAmount    FLOAT               NOT NULL,
    BudgetCategory  NVARCHAR(255)       NOT NULL,
    AccNum          VARCHAR(20)         NOT NULL,
    CONSTRAINT PK_Budget PRIMARY KEY (BudgetID),
    CONSTRAINT FK_Budget_AccNum FOREIGN KEY (AccNum)
        REFERENCES Account (AccNum)
);


--Insert sample values
insert into Profile(FullName, AccessCode, PinHash)
values
('Ben Johnson', '1234567', '$2b$12$XotDxm0656ovIqS/GM6kE.doLo4TKqyvhM21A6ST1KtAswPi5GAXS'),
('Alice Johnson', '2345678', '$2b$12$z4rIi8CITVlHuBsq4miP5.8BEbmFMiO1bXmBRlBVhI0s29Cs8afl2'),
('Bob Smith', '3456789', '$2b$12$rLnEueQZq0iRHVKUZDy7vutrjOmBGKau/uLfo.xnMTHWza13iVr0S'),
('Carol Lee', '4567890', '$2b$12$bcV72RGe07uEYQjUFGxrieUFDs5RCl.d3yCJD9adyK0QorwDKmiIW'),
('David Brown', '5678901', '$2b$12$eJmaZ7edAQ21wCHD1JGis.j.iH2dRIW/VCEPYKPVVhVnhINCd7z7W'),
('Sairam', '6789012', '$$2a$12$UV/Y5/ClKPR9IPs2zYVMSOw5sDUfsZ6G31vL0LqjRnRuubZNVRvQy'),
('James Taylor', '7890123', '$$2a$12$TYtYaXFhoCddcUGt1vjFt.8NbXN8rpFF1JvT.NBt2cq7kEeCc9Lc2');

insert into Account(AccNum, AccType, Balance, ProfileId)
values
('123-456789-001', 'Statement Savings Account', 1000.00, 1),
('234-567890-002', 'Statement Savings Account', 2500.75, 2),
('345-678901-003', 'Current Account', 5000.50, 3),
('456-789012-004', 'Statement Savings Account', 1500.20, 4),
('567-890123-005', 'Current Account', 1000.00, 5);

INSERT INTO Account (AccNum, AccType, Balance, ProfileId, CurrencyCode)
VALUES
('789-012345-008', 'Savings Account', 3000.50, 6, 'INR'),
('678-901234-007', 'Current Account', 5000.00, 5, 'USD');


insert into Card (CardNum, CardName, CardType, DateOfExpiry, CVV, AccNum)	
values
('1234 5678 9012 3456', 'Guan Quan', 'Debit', '2025-12-31', '123', '123-456789-001'),
('2345 6789 0123 4567', 'Bob Smith', 'Debit','2026-11-30', '456', '234-567890-002'),
('3456 7890 1234 5678', 'Carol Lee', 'Debit','2025-08-31', '789', '345-678901-003'),
('4567 8901 2345 6789', 'David Brown', 'Debit','2025-05-31', '012', '456-789012-004'),
('5678 9012 3456 7890', 'Eve Williams', 'Debit','2027-04-30', '345', '567-890123-005');

INSERT INTO Biller (BillerName, BillerAccNum, BankName, Category)
VALUES 
('SP Services', '123-456789-ABC', 'Overseas-Chinese Bank (OCBC)', 'Utilities'),
('StarHub Telecom', '111-222333-XYZ', 'Overseas-Chinese Bank (OCBC)', 'Telecom');

INSERT INTO Bills (BillerID, ProfileID, BillAmount, DueDate)
VALUES 
(1, 1, 120.50, '2025-03-15'),
(2, 1, 89.90, '2025-03-10');

insert into BankTransaction(TransactDate, TransactAmount, AccSender, AccReceiver)
values
('2025-01-11', 100.50, '234-567890-002','123-456789-001'),
('2025-01-12', 250.00, '234-567890-002', '345-678901-003'),
('2025-01-13', 75.25, '345-678901-003', '123-456789-001'),
('2025-01-14', 150.00, '456-789012-004', '567-890123-005'),
('2025-01-15', 300.00, '123-456789-001', '456-789012-004');

INSERT INTO BankTransaction (TransactDate, TransactAmount, AccSender, AccReceiver, TransactType)
VALUES ('2024-12-01', 100.00, '123-456789-001', '789-012345-008', 'Foreign Exchange');

INSERT INTO BankTransaction (TransactDate, TransactAmount, AccSender, AccReceiver, TransactPurpose)
VALUES
-- Grocery or Retail Purchases
('2024-10-20', 80.25, '123-456789-001', '234-567890-002', 'Grocery or Retail Purchases'),
('2024-11-15', 95.00, '234-567890-002', '345-678901-003', 'Grocery or Retail Purchases'),
('2024-12-10', 110.50, '345-678901-003', '456-789012-004', 'Grocery or Retail Purchases'),
('2025-02-05', 120.25, '456-789012-004', '567-890123-005', 'Grocery or Retail Purchases'),
('2025-02-15', 130.00, '567-890123-005', '123-456789-001', 'Grocery or Retail Purchases'),
('2025-02-20', 140.75, '123-456789-001', '234-567890-002', 'Grocery or Retail Purchases'),

-- ATM Withdrawals or Cash Deposits
('2024-10-23', 300.00, '456-789012-004', NULL, 'ATM Withdrawals or Cash Deposits'),
('2024-11-05', 450.00, '567-890123-005', NULL, 'ATM Withdrawals or Cash Deposits'),
('2024-12-18', 500.00, '123-456789-001', NULL, 'ATM Withdrawals or Cash Deposits'),
('2025-02-10', 400.00, '234-567890-002', NULL, 'ATM Withdrawals or Cash Deposits'),
('2025-02-18', 350.00, '345-678901-003', NULL, 'ATM Withdrawals or Cash Deposits'),
('2025-02-22', 50.00, '123-456789-001', NULL, 'ATM Withdrawals or Cash Deposits'),

-- Online Shopping
('2024-10-25', 50.00, '123-456789-001', '345-678901-003', 'Online Shopping'),
('2024-11-14', 75.50, '234-567890-002', '456-789012-004', 'Online Shopping'),
('2024-12-22', 100.00, '345-678901-003', '567-890123-005', 'Online Shopping'),
('2025-02-07', 90.25, '456-789012-004', '123-456789-001', 'Online Shopping'),
('2025-02-15', 110.75, '567-890123-005', '234-567890-002', 'Online Shopping'),
('2025-02-20', 95.50, '123-456789-001', '345-678901-003', 'Online Shopping'),

-- Medical or Healthcare Payments
('2024-10-28', 220.75, '456-789012-004', '123-456789-001', 'Medical or Healthcare Payments'),
('2024-11-20', 250.50, '567-890123-005', '234-567890-002', 'Medical or Healthcare Payments'),
('2024-12-08', 300.00, '123-456789-001', '345-678901-003', 'Medical or Healthcare Payments'),
('2025-02-10', 350.25, '234-567890-002', '456-789012-004', 'Medical or Healthcare Payments'),
('2025-02-18', 400.00, '345-678901-003', '567-890123-005', 'Medical or Healthcare Payments'),
('2025-02-22', 450.75, '456-789012-004', '123-456789-001', 'Medical or Healthcare Payments'),

-- Others
('2024-10-30', 300.00, '123-456789-001', '234-567890-002', 'Others'),
('2024-11-25', 400.50, '234-567890-002', '345-678901-003', 'Others'),
('2024-12-15', 200.00, '345-678901-003', '567-890123-005', 'Others'),
('2025-02-12', 350.75, '456-789012-004', '123-456789-001', 'Others'),
('2025-02-18', 450.25, '567-890123-005', '234-567890-002', 'Others'),
('2025-02-22', 500.00, '123-456789-001', '345-678901-003', 'Others'),

-- Uncategorised
('2024-10-31', 100.00, '123-456789-001', '234-567890-002', 'Uncategorised'),
('2024-11-30', 200.50, '234-567890-002', '345-678901-003', 'Uncategorised'),
('2024-12-20', 150.00, '345-678901-003', '567-890123-005', 'Uncategorised'),
('2025-02-14', 250.75, '456-789012-004', '123-456789-001', 'Uncategorised'),
('2025-02-18', 300.25, '567-890123-005', '234-567890-002', 'Uncategorised'),
('2025-02-22', 350.00, '123-456789-001', '345-678901-003', 'Uncategorised');


INSERT INTO ForeignExchangeTransaction (TransactNo, FromCurrency, ToCurrency, ExchangeRate, ConvertedAmount)
VALUES (6, 'SGD', 'INR', 63.67, 6367.00);


insert into Recipient (RecipientName, BankName, AccNum, ProfileId)
values
-- Recipients for ProfileId 1 (Ben Johnson)
('Alice Johnson', 'Overseas-Chinese Bank (OCBC)', '234-567890-002', 1),
('Bob Smith', 'United Overseas Bank (UOB)', '345-678901-003', 1),
('Carol Lee', 'Development Bank of Singapore (DBS)', '456-789012-004', 1),
('Sairam', 'State Bank of India (SBI)', '789-012345-008', 1),

-- Recipients for ProfileId 2 (Alice Johnson)
('Ben Johnson', 'Overseas-Chinese Bank (OCBC)', '123-456789-001', 2),
('David Brown', 'Standard Chartered Bank', '567-890123-005', 2),
('Carol Lee', 'Development Bank of Singapore (DBS)', '456-789012-004', 2),

-- Recipients for ProfileId 3 (Bob Smith)
('Alice Johnson', 'Overseas-Chinese Bank (OCBC)', '234-567890-002', 3),
('Ben Johnson', 'Overseas-Chinese Bank (OCBC)', '123-456789-001', 3),
('David Brown', 'Standard Chartered Bank', '567-890123-005', 3),

-- Recipients for ProfileId 4 (Carol Lee)
('Bob Smith', 'United Overseas Bank (UOB)', '345-678901-003', 4),
('Alice Johnson', 'Overseas-Chinese Bank (OCBC)', '234-567890-002', 4),
('Ben Johnson', 'Overseas-Chinese Bank (OCBC)', '123-456789-001', 4),

-- Recipients for ProfileId 5 (David Brown)
('Carol Lee', 'Development Bank of Singapore (DBS)', '456-789012-004', 5),
('Alice Johnson', 'Overseas-Chinese Bank (OCBC)', '234-567890-002', 5),
('Bob Smith', 'United Overseas Bank (UOB)', '345-678901-003', 5);

--Insert values for the categories
INSERT INTO ForumCategory (CategoryName) 
VALUES 
('Server Downtime'),
('Financial Knowledge'),
('Tips and Tricks');


-- Insert messages values
INSERT INTO ForumMessages (CategoryID, SenderName, MessageContent)
VALUES 
(1, 'Alice Johnson', 'The server has been down since yesterday. Any updates?'),
(1, 'Cristhian', 'I was in the middle of a transaction! Now I have to start all over again.'),
(1, 'Laven', 'Is my account information safe? I hope the downtime is not due to a security breach...'),
(1, 'Guan Quan', 'Has anyone received any notification from the bank about the downtime?'),
(1, 'Bob Smith', '@Alice Johnson The issue seems to be resolved now.'),
(2, 'Brad', 'Does anyone know if the Singapore governments decision to increase GST will affect the stock market?'),
(2, 'Haziq', 'I am a freelancer and wondering how to file my taxes in Singapore. Any advice?'),
(2, 'Endrick', 'Hi! As a fellow freelancer, I have found it helpful to use accounting software like QuickBooks or Xero to track my income and expenses.'),
(2, 'Carol Lee', 'Can someone recommend a good financial planner?'),
(3, 'Seah', 'I have set up automatic transfers from my checking account to my savings account. It is a great way to build up your emergency fund without having to think about it!'),
(3, 'Tash', 'Does anyone use a budgeting app like Mint or You Need a Budget (YNAB)? I have found it really helps me track my expenses and stay on top of my finances'),
(3, 'David Brown', 'Use keyboard shortcuts to navigate quickly.');


-- Insert values for RewardsHistory
INSERT INTO RewardsHistory (RewardDescription, RewardType, RewardAmount, RewardDate, AccNum)
VALUES
('Receive 5$ cashback', 'Cashback', 5.00, '2024-10-20', '123-456789-001'),
('Receive 5$ cashback', 'Cashback', 5.00, '2024-11-20', '123-456789-001'),
('Receive 5$ cashback', 'Cashback', 5.00, '2024-12-20', '123-456789-001');

-- Insert values for Budget
INSERT INTO Budget (BudgetAmount, BudgetCategory, AccNum)
VALUES
(500.00, 'Grocery or Retail Purchases', '123-456789-001'),
(300.00, 'Online Shopping', '123-456789-001'),
(100.00, 'ATM Withdrawals or Cash Deposits', '123-456789-001'),
(400.00, 'Others', '123-456789-001');