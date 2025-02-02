/*--------------------------------  Guan Quan Functions --------------------------------*/
function IndexLoginSubmit(formId){
    // Get login form
    const loginForm = document.getElementById(formId);

    loginForm.addEventListener("submit", async function(event){
        event.preventDefault();

        let inputFields = document.querySelectorAll(`#${formId} .form-floating input`);
        let errorMessage = document.getElementById("login-validation-error");

        // Get email and password inputs
        const accessCode = document.getElementById("login-access-code").value;
        const pin = document.getElementById("login-pin").value;
        
        let verfied = false;
        let authenticated = false;
        let homePage = '/';

        verfied = validateInput();

        if (verfied){
            authenticated = await authenticateAccount();
        }

        if(authenticated){
            const selectedLink = sessionStorage.getItem("selectedLink");
            console.log(selectedLink)
            sessionStorage.removeItem("selectedLink");
            if (selectedLink === null) {
                // If no link is stored, redirect to the default homepage
                window.location.href = "../homepage/homepage.html";
            } else {
                // Otherwise, redirect to the stored link
                window.location.href = selectedLink;
            }
        };

        function validateInput(){
            let errorList = [];

            inputFields.forEach((inputField) => {
                if (inputField.classList.contains("error")){
                    inputField.classList.remove("error");   // Remove Red Border
                }
                if (inputField.classList.contains("success")){
                    inputField.classList.remove("success");   // Remove Green Border
                }
            });
            
            // Validate access code
            if (accessCode === "") {
                
                inputFields[0].classList.add("error");
                errorMessage.style.visibility = "visible";
                errorMessage.style.color = "#f03c3c";
                errorList.push("Access Code is required");
            }
            else if (accessCode.length != 7){
                
                inputFields[0].classList.add("error");
                errorMessage.style.visibility = "visible";
                errorMessage.style.color = "#f03c3c";
                errorList.push("Access Code must be 7 digits");
            }
            else{
                inputFields[0].classList.add("success");
            }

            // Validate pin
            if (pin === "") {
                inputFields[1].classList.add("error");
                errorMessage.style.visibility = "visible";
                errorMessage.style.color = "#f03c3c";
                errorList.push("Pin is required");
            }
            else if (pin.length != 6){
                inputFields[1].classList.add("error");
                errorMessage.style.visibility = "visible";
                errorMessage.style.color = "#f03c3c";
                errorList.push("Pin must be 6 digits");
            }
            else{
                inputFields[1].classList.add("success");
            }

            if (errorList.length === 0){
                return true;
            }
            else{
                errorMessage.textContent = (errorList.join(", "))+".";
                return false;
            }
        }

        async function authenticateAccount(){
            // Send login request to the server
            const response = await fetch("/login",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    accessCode: accessCode,
                    pin: pin
                })
            });

            const data = await response.json(); // Convert response to JSON

            if (response.status === 200) {  // If user is authenticated successfully

                inputFields.forEach((inputField) => {
                    if (inputField.classList.contains("error")){
                        inputField.classList.remove("error");   // Remove Red Border
                    }
                    inputField.classList.add("success");    // Add Green Border
                });

                // Display success message
                errorMessage.style.visibility = "visible";
                errorMessage.style.color = "#349c88";
                errorMessage.textContent = "Authenticated successfully";

                sessionStorage.setItem("token", data.token);   // Store user data in session storage
                sessionStorage.setItem("profileId", data.profileId);
                const profileId = data.profileId
                const response = await fetch(`http://localhost:3000/account/${profileId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    },
                });
                const details = await response.json();
                if (!response.ok){
                    alert(details.message);
                    return false;
                }
                console.log(details)
                
                sessionStorage.setItem('AccNum', details.AccNum);   // Set the session storgae
                sessionStorage.setItem('AccCurrency', details.CurrencyCode);   // Set the session storgae

                alert("User Authenticated successfully");
                console.log("User Authenticated successfully");

                return true 
            }
            else if (response.status === 400 || response.status === 401){   // If authenticated failed

                inputFields.forEach((inputField) => {
                    if (inputField.classList.contains("success")){
                        inputField.classList.remove("success"); // Remove Green Border
                    }
                    inputField.classList.add("error");  // Add Red Border
                });

                // Display error message
                errorMessage.style.visibility = "visible";
                errorMessage.style.color = "#f03c3c";
                if (data.errors){
                    errorMessage.textContent = data.errors;
                }
                else{
                    errorMessage.textContent = data.message;
                }
                console.log(errorMessage.textContent);

                return false;
            }
            else if (response.status === 404){   // If account not found
                inputFields.forEach((inputField) => {
                    if (inputField.classList.contains("success")){
                        inputField.classList.remove("success"); // Remove Green Border
                    }
                    inputField.classList.add("error");  // Add Red Border
                });

                // Display error message
                errorMessage.style.visibility = "visible";
                errorMessage.style.color = "#f03c3c";
                errorMessage.textContent = data.message;
                console.log(errorMessage.textContent);

                return false;
            }
            else if (response.status === 500){   // If server error
                alert(data.message);
                return false;
            }
        }
    },false)
}

async function displayAccDetails() {
    const profileId = sessionStorage.getItem("profileId");
    const response = await fetch(`/account/${profileId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem('token')}`
        }
    });
    if (!response.ok) {
        alert("Failed to fetch account details.");
        return;
    }
    const data = await response.json();
    console.log(data);
    const accNum = data.AccNum;
    const accType = data.AccType;
    const balance = data.Balance;
    const currencyCode = data.CurrencyCode;

    const today = new Date();
    const month = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();
    const monthYear = `${month} ${year}`;

    const accountBalanceContainer = document.querySelector('.account-balance-container');
    accountBalanceContainer.innerHTML = `
        <h3>${accType}</h3>
        <p class="account-balance">${currencyCode} ${balance}</p>
        <p class="account-balance-month">${monthYear}</p>
    `;
    
}

// Function to process and display expenses
async function displayExpenses() {
    const data = await getExpenses();
    console.log('Expenses', data); // Log data

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlySpending = {};
    const currentMonthSpending = {};

    // Process data
    data.forEach(transaction => {
        const transactionDate = new Date(transaction.TransactDate);
        const month = transactionDate.getMonth();
        const year = transactionDate.getFullYear();

        // Group by month-year for line graph
        const monthYearKey = `${year}-${String(month + 1).padStart(2, "0")}`; // Add leading zero for proper sorting
        if (!monthlySpending[monthYearKey]) {
            monthlySpending[monthYearKey] = 0;
        }
        monthlySpending[monthYearKey] += transaction.TransactAmount;

        // Categorize for pie chart if in the current month and year
        if (month === currentMonth && year === currentYear) {
            const purpose = transaction.TransactPurpose;
            if (!currentMonthSpending[purpose]) {
                currentMonthSpending[purpose] = 0;
            }
            currentMonthSpending[purpose] += transaction.TransactAmount;
        }
    });

    // Prepare data for line chart
    const lineChartLabels = Object.keys(monthlySpending).sort(); // Proper chronological order
    const lineChartData = lineChartLabels.map(key => monthlySpending[key]);

    // Render line chart
    const lineCtx = document.getElementById("line-chart").getContext("2d");

    if (window.lineChart) {
        window.lineChart.destroy();
    }

    window.lineChart = new Chart(lineCtx, {
        type: "line",
        data: {
            labels: lineChartLabels,
            datasets: [
                {
                    label: "Spending",
                    data: lineChartData,
                    backgroundColor: "rgba(255, 99, 132, 0.5)", // Red with transparency
                    borderColor: "rgb(255, 99, 132)", // Solid red
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 3,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: "Monthly Spending",
                    font: {
                        size: 30,
                        family: "sans-serif",
                        weight: "bold",
                    },
                    padding: 10,
                },
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        font: {
                            size: 15,
                            family: "sans-serif",
                            weight: "bold",
                        },
                        color: "#666",
                    },
                },
                datalabels: {
                    display: true,
                    align: "top",
                    anchor: "center",
                    backgroundColor: "#fff",
                    borderColor: "#ddd",
                    borderRadius: 6,
                    borderWidth: 1,
                    padding: 4,
                    color: "#666",
                    font: {
                        size: 17,
                        family: "sans-serif",
                        weight: "bold",
                    },
                    formatter: value => `$${value.toFixed(2)}`,
                },
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            size: 18,
                            family: "sans-serif",
                            weight: "normal",
                        },
                        color: "#666",
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.1)",
                    },
                },
                y: {
                    ticks: {
                        font: {
                            size: 18,
                            family: "sans-serif",
                            weight: "normal",
                        },
                        color: "#666",
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.1)",
                    },
                },
            },
        },
    });

    // Calculate total spending for the current month
    const totalSpending = Object.values(currentMonthSpending).reduce((sum, value) => sum + value, 0);

    // Prepare data for pie chart (percentages)
    const pieChartLabels = Object.keys(currentMonthSpending);
    const pieChartData = pieChartLabels.map(key => {
        const percentage = (currentMonthSpending[key] / totalSpending) * 100;
        return parseFloat(percentage.toFixed(2)); // Keep 2 decimal places
    });

    console.log("Pie Chart Labels:", pieChartLabels);
    console.log("Pie Chart Data:", pieChartData);

    // Render pie chart
    const pieCtx = document.getElementById("pie-chart").getContext("2d");

    if (window.pieChart) {
        window.pieChart.destroy();
    }

    window.pieChart = new Chart(pieCtx, {
        type: "doughnut",
        data: {
            labels: pieChartLabels, // Labels like "Food", "Housing"
            datasets: [
                {
                    data: pieChartData, // Percentage values
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
                    borderColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
                    borderWidth: 3,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    align: "center",
                    labels: {
                        font: {
                            size: 15,
                            family: "sans-serif",
                            weight: "bold",
                        },
                        color: "#666666",
                        padding: 20,
                    },
                },
                datalabels: {
                    display: true, // Enable datalabels
                    align: "end", // Align labels
                    anchor: "center", // Position in the center of each segment
                    color: "#666666",
                    font: {
                        family: "sans-serif",
                        size: 15,
                        weight: "bold",
                    },
                    backgroundColor: "#fff", // White background
                    borderColor: "#ddd", // Light gray border
                    borderWidth: 1, // Thin border
                    borderRadius: 6, // Rounded corners
                    formatter: (value, context) => `${value.toFixed(2)}%`, // Format as percentage
                },
            },
        },
        plugins: [ChartDataLabels], // Ensure the plugin is registered
    });

    // Calculate the percentage of cash withdrawals or deposits
    const cashWithdrawalIndex = pieChartLabels.indexOf("ATM Withdrawals or Cash Deposits");
    const cashWithdrawalPercentage = cashWithdrawalIndex !== -1 ? pieChartData[cashWithdrawalIndex] : 0;
    console.log("Cash Withdrawal Percentage:", cashWithdrawalPercentage);

    getRewardsEligibility(data, cashWithdrawalPercentage);
}

// Function to fetch expenses
async function getExpenses() {
    const profileId = sessionStorage.getItem("profileId");
    const token = sessionStorage.getItem("token");

    const response = await fetch(`/transactions/expenses/${profileId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });
    
    return response.json;
}

// Functions to get rewards eligibility
async function getRewardsEligibility(data, cashWithdrawalPercentage) {
    // Fetch reward eligibility data
    const accNum = "123-456789-001";
    // const accNum = JSON.parse(sessionStorage.getItem("AccNum"));
    const token = sessionStorage.getItem("token");

    // Check if user has already claimed the reward this month
    const hasClaimed = await checkRewardsHistory(accNum, token);
    const isEligible = await checkRewardsEligibility(data, cashWithdrawalPercentage);
    

    const claimButton = document.getElementById("reward-claim-button");

    if (hasClaimed) {
        claimButton.textContent = "Reward Already Claimed";
        claimButton.disabled = true; // Disable the button
        claimButton.style.backgroundColor = "#999"; // Change color to indicate it's inactive
        return;
    } else if (isEligible) {
        claimButton.textContent = "Claim Reward";
        claimButton.disabled = false; // Enable the button
        claimButton.style.backgroundColor = "#f03c3c"; // Restore original color
    }else{
        claimButton.textContent = "Not Eligible for Reward";
        claimButton.disabled = true; // Disable the button
        claimButton.style.backgroundColor = "#999"; // Change color to indicate it's inactive
    }
    
}

// Function to check if reward has been claimed the current month
async function checkRewardsHistory(accNum, token) {
    const response = await fetch(`/rewards`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
            "profileId": profileId,
        })
    });

    if (!response.ok) {
        alert("Failed to fetch reward eligibility data.");
        return;
    }
    
    const rewardData = await response.json();
    
    // Get current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
    const currentYear = currentDate.getFullYear();

    // Check if user has already claimed the reward this month
    let hasClaimed = rewardData.some(reward => {
        let rewardDate = new Date(reward.RewardDate);
        return rewardDate.getMonth() + 1 === currentMonth && rewardDate.getFullYear() === currentYear;
    });

    return hasClaimed;
}

// Function to check other rewards eligibility
async function checkRewardsEligibility(data, cashWithdrawalPercentage) {
    const cashWithdrawalPercentageThreshold = 10; // 10% threshold for cash withdrawals or deposits
    let isEligible;

    // Check if the user has at least 2 transactions in the current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const currentMonthTransactions = data.filter(transaction => {
        const transactionDate = new
        Date(transaction.TransactDate);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    if (currentMonthTransactions.length >= 2) {
        isEligible = true;
    }else {
        isEligible = false;
    }

    // Check if the has percentage of cash withdrawals or deposits is below the threshold
    if (cashWithdrawalPercentage <= cashWithdrawalPercentageThreshold) {
        isEligible = true;
    } else {
        isEligible = false;
    }

    return isEligible;
}

// Function to get Expenses
async function getExpenses(){
    const profileId = sessionStorage.getItem("profileId");
    const token = sessionStorage.getItem("token");

    const response = await fetch(`/transactions/expenses/${profileId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await response.json();
    return data;
}

// Functiion to get user budget
async function fetchUserBudget() {
    const profileId = sessionStorage.getItem("profileId");
    const token = sessionStorage.getItem("token");

    // Get accNum by profileId
    const response1 = await fetch(`/account/${profileId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        }
    });
    if (!response1.ok) {
        console.alert("Failed to fetch account details.");
        return null;
    }
    const data = await response1.json();

    const response2 = await fetch(`/expense/budget/${data.AccNum}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response2.ok) {
        console.error("Failed to fetch budget data.");
        return null;
    }

    const budgetData = await response2.json();
    console.log("User Budget Data:", budgetData);
    return budgetData;
}

// Function to claim reward
function claimReward(){
    const rewardClaimButton = document.getElementById('reward-claim-button');
    rewardClaimButton.addEventListener('click', async function(event){
        event.preventDefault();

        const profileId = sessionStorage.getItem("profileId");

        //Get accNum with profileId
        const response1 = await fetch(`/account/${profileId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem('token')}`
            }
        });
        if (!response1.ok) {
            alert("Failed to fetch account details.");
            return;
        }
        const data = await response1.json();
        const recipientAcc = data.AccNum;

        
        // Transfer $5 to the recipient account
        const response2 = await fetch("/transfer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify({
                accSender: null,
                accReceiver: recipientAcc,
                amount: 5,
                transactPurpose: "Bank Reward Claim"
            })
        });
        if (!response2.ok) {
            alert("Failed to claim reward.");
            return;
        }

        // Update Rewards History
        const response3 = await fetch("/rewards-claim", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify({
                rewardDescription: "Receive 5$ cashback",
                rewardType: "Cashback",
                rewardAmount: 5,
                accNum: recipientAcc
            })
        });
        if (!response3.ok) {
            alert("Failed to update rewards history.");
            return;
        }
        alert("Reward claimed successfully!");
        location.reload();
    });
}

// Function to display budget management
async function displayBudgetManagement() {
    const expensesData = await getExpenses();
    const budgetDataArray = await fetchUserBudget();

    const budgetData = {};
    if (Array.isArray(budgetDataArray)) {
        budgetDataArray.forEach(item => {
            budgetData[item.BudgetCategory] = item.BudgetAmount; // ✅ Correctly map budget category to amount
        });
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const budgetContainer = document.getElementById("budget-container");
    budgetContainer.innerHTML = ""; // Clear existing content

    // **Fixed Spending Categories**
    const categories = [
        "Grocery or Retail Purchases",
        "ATM Withdrawals or Cash Deposits",
        "Online Shopping",
        "Medical or Healthcare Payments",
        "Uncategorised",
        "Others"
    ];

    // **Calculate total spending per category**
    const monthlyCategoryExpenses = {};
    categories.forEach(category => monthlyCategoryExpenses[category] = 0); // Initialize all categories to 0

    expensesData.forEach(transaction => {
        const transactionDate = new Date(transaction.TransactDate);
        const month = transactionDate.getMonth();
        const year = transactionDate.getFullYear();

        if (month === currentMonth && year === currentYear) {
            const category = transaction.TransactPurpose;
            if (monthlyCategoryExpenses.hasOwnProperty(category)) {
                monthlyCategoryExpenses[category] += transaction.TransactAmount;
            }
        }
    });

    // **Populate UI**
    categories.forEach(category => {
        const spending = monthlyCategoryExpenses[category] || 0; // Default to 0 if no spending
        const budget = budgetData[category] || 0;

        const card = document.createElement("div");
        card.classList.add("budget-card");

        // Red if overspending, Green otherwise. If budget is 0 or equal, always green.
        const amountColor = budget > 0 && spending > budget ? "red" : "green";

        card.innerHTML = `
            <div class="budget-header">${category}</div>
            <div class="amount-spent" style="color: ${amountColor};">$${spending.toFixed(2)}</div>
            <div class="budget-section">
                <span>Budget</span>
                <span class="budget-value">$${budget.toFixed(2)}</span>
                <input type="number" class="budget-input" value="${budget.toFixed(2)}">
            </div>
            <div class="budget-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="change-btn">Change</button>
            </div>
        `;


        // **Add Event Listeners**
        const budgetValue = card.querySelector(".budget-value");
        const budgetInput = card.querySelector(".budget-input");
        const actionsDiv = card.querySelector(".budget-actions");
        const cancelBtn = card.querySelector(".cancel-btn");
        const changeBtn = card.querySelector(".change-btn");

        // **Enable Edit Mode**
        budgetValue.addEventListener("click", () => {
            budgetValue.style.display = "none";
            budgetInput.style.display = "inline-block";
            actionsDiv.style.display = "flex";
        });

        // **Cancel Changes**
        cancelBtn.addEventListener("click", () => {
            budgetInput.value = budget.toFixed(2);
            budgetValue.style.display = "inline-block";
            budgetInput.style.display = "none";
            actionsDiv.style.display = "none";
        });

        // **Save Changes**
        changeBtn.addEventListener("click", async () => {
            const newBudget = parseFloat(budgetInput.value);
            if (isNaN(newBudget) || newBudget < 0) {
                alert("Invalid budget amount.");
                return;
            }

            const updated = await updateUserBudget(category, newBudget);
            if (updated) {
                budgetValue.textContent = `$${newBudget.toFixed(2)}`;
                budgetValue.style.display = "inline-block";
                budgetInput.style.display = "none";
                actionsDiv.style.display = "none";
                alert("Budget updated successfully!");
            }
        });

        budgetContainer.appendChild(card);
    });
}

// Function to update user budget
async function updateUserBudget(category, newBudget) {
    const profileId = sessionStorage.getItem("profileId");
    const token = sessionStorage.getItem("token");

    // Get accNum by profileId
    const response1 = await fetch(`/account/${profileId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        }
    });
    if (!response1.ok) {
        console.alert("Failed to fetch account details.");
        return false;
    }
    const data = await response1.json();

    const response2 = await fetch(`/expense/budget/${data.AccNum}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
            budgetCategory: category,
            budgetAmount: newBudget
        }),
    });
    if (!response2.ok) {
        console.error("Failed to update budget data.");
        return false;
    }

    return true;
}

/*--------------------------------  Sairam Functions --------------------------------*/
const profileId = JSON.parse(sessionStorage.getItem("profileId")); // Retrieve the profile ID from the session storage
console.log(profileId)
const token = sessionStorage.getItem("token"); // Retrieve the token from the session storage
// Retrieve profile details 
async function fetchProfileDetails() {
    try {
        // Fetch account details from the server using the profile ID
        const response = await fetch(`http://localhost:3000/profile/${profileId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            },
        });
        const data = await response.json();
        console.log(data)
        document.getElementById('user-name').innerText = data.FullName;
        sessionStorage.setItem("FullName", data.FullName);  

    } catch (error) {
        console.error("Error:", error.message);
        document.getElementById('user-name').innerHTML = "Error fetching full name";
    }
}
// Retrieve account details 
async function fetchAccountDetails() {
    try {
        // Fetch account details from the server using the profile ID
        const response = await fetch(`http://localhost:3000/account/${profileId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            },
        });
        const data = await response.json();
        console.log(data)
        document.getElementById('account-type').innerText = data.AccType;
        document.getElementById('account-no').innerText = data.AccNum;
        document.getElementById('account-balance').innerText = `$${data.Balance.toFixed(2)}`;

        
    } catch (error) {
        console.error("Error fetching account details:", error);

        // Display a user-friendly error message
        let userFriendlyMessage = "An error occurred";
        document.getElementById('account-balance').innerText = userFriendlyMessage; // Show the user-friendly message
    }
}
// Retrieve card details 
async function fetchCardDetails() {
    //Retrieve accNum
    const accNum = sessionStorage.getItem('AccNum');
    try {
        // Fetch card details from the server using the profile ID and accNum
        const response = await fetch(`http://localhost:3000/card/${profileId}/${accNum}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            },
        });
        const data = await response.json();
        console.log(data)
        document.querySelector('.card-number-title').innerText = `${data.CardType} Card No`
        document.querySelector('.card-number').innerText = data.CardNum

    } catch (error) {
        console.error("Error:", error.message);
        document.querySelector('.card-number-title').innerText = "An error occurred";
        document.querySelector('.card-number').innerText = "An error occurred";
    }
}

// Function to fetch transactions and create cards
async function fetchTransactions() {
    const accNum = sessionStorage.getItem('AccNum'); // Retrieve stored account number
    const customDateRange = document.getElementById("customDateRange");
    const selectedRangeElement = document.getElementById('selectedRange');
    let startDate = '';
    let endDate = '';
    selectedRangeElement.innerText = '';
    
    const rangeOption = document.getElementById("rangeOption").value;
    
    if (rangeOption === "custom") {
        startDate = document.getElementById('startDateInput').value;
        endDate = document.getElementById('endDateInput').value;
        // Reset
        customDateRange.style.display = "none";
        document.getElementById('startDateInput').value = '';
        document.getElementById('endDateInput').value = '';
        
        // Format and set the custom date range display
        const formattedStartDate = new Date(startDate).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        }).replace(/ /g, ' ');
        
        const formattedEndDate = new Date(endDate).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        }).replace(/ /g, ' ');

        selectedRangeElement.innerText = `${formattedStartDate} - ${formattedEndDate}`;
    } else if (rangeOption === "1month") {
        // Today's date
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        startDate = oneMonthAgo.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];

        const formattedToday = today.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        }).replace(/ /g, ' ');
        
        const formattedOneMonthAgo = oneMonthAgo.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        }).replace(/ /g, ' ');

        selectedRangeElement.innerText = `${formattedOneMonthAgo} - ${formattedToday}`;
    } else if (rangeOption === "3months") {
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        startDate = threeMonthsAgo.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];

        const formattedToday = today.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        }).replace(/ /g, ' ');
        
        const formattedThreeMonthsAgo = threeMonthsAgo.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        }).replace(/ /g, ' ');

        selectedRangeElement.innerText = `${formattedThreeMonthsAgo} - ${formattedToday}`;
    }

    // Base URL
    let url = `http://localhost:3000/transactions/${accNum}`;
    
    // Append query parameters based on range option
    if (rangeOption === "custom") {
        url += `?rangeOption=${rangeOption}&startDate=${startDate}&endDate=${endDate}`;
    } else {
        url += `?rangeOption=${rangeOption}`;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        // console.log(data);
        sessionStorage.setItem("transactions", JSON.stringify(data));
        sessionStorage.setItem("startDate", startDate); 
        sessionStorage.setItem("endDate", endDate);

        // Clear previous transaction cards if any
        const transactionContainer = document.querySelector('.transaction-list');
        transactionContainer.innerHTML = '';

        // Check if there are transactions
        if (data.length > 0) {
            selectedRangeElement.style.display = 'block';

            // Loop through the transactions and create cards
            data.forEach(transaction => {
                let amountDisplay;
                let amountColor;
                if (transaction.SenderName === "You") {
                    amountDisplay = `-$${transaction.TransactAmount}`;
                    amountColor = '#e40414';
                } else {
                    amountDisplay = `+$${transaction.TransactAmount}`;
                    amountColor = '#349c88';
                }

                const transactionCard = document.createElement('div');
                transactionCard.className = 'transaction-card';

                transactionCard.innerHTML = `
                   <div class="transaction-title-container">
                        <h2 class="transaction-title">Transaction No: ${transaction.TransactNo}</h2>
                        <i class="fa fa-volume-up speaker-icon" 
                        onclick="speak('${transaction.TransactAmount} dollars has been sent from ${transaction.SenderName} to ${transaction.ReceiverName} on ${transaction.TransactDate}')"></i>
                    </div>

                    <p class="transaction-date">
                        ${transaction.TransactDate}
                    </p>
                    <p class="transaction-from">
                        From: ${transaction.SenderName}
                    </p>
                   <p class="transaction-to">
                        To: ${transaction.AccReceiver ? transaction.ReceiverName : transaction.BillerName}
                    </p>
                    <p class="transaction-type">
                        Type: ${transaction.TransactType}
                    </p>
                    <div class="transaction-amount">Amount: <span style="color: ${amountColor};">${amountDisplay}</span></div>
                `;

                transactionContainer.appendChild(transactionCard);
            });
        } else {
            selectedRangeElement.style.display = 'block';
            selectedRangeElement.innerText = 'No transactions found';
        }        
    } catch (error) {
        console.error('Error fetching transactions:', error);
        selectedRangeElement.style.display = 'block';
        selectedRangeElement.innerText = 'Error fetching transactions';
    }
}

async function generateTransactionInsights(transactions) {
    try {
        const response = await fetch("/generate-insights", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ transactions })
        });

        const data = await response.json();

        // Ensure insights are in valid JSON format
        if (typeof data.insights === "string") {
            data.insights = JSON.parse(data.insights);
        }

        console.log("Insights Data Parsed Successfully:", data);
        return data.insights;  // Return the parsed data
    } catch (error) {
        console.error("Error communicating with OpenAI API:", error);
        return { totalIncome: 0, totalExpense: 0, insights: ["Error retrieving insights."] };
    }
}



