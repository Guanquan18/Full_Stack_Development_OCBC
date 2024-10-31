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
            window.location.href = "../homepage/homepage.html";
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
                errorMessage.style.color = "red";
                errorList.push("Access Code is required");
            }
            else if (accessCode.length != 7){
                
                inputFields[0].classList.add("error");
                errorMessage.style.visibility = "visible";
                errorMessage.style.color = "red";
                errorList.push("Access Code must be 7 digits");
            }
            else{
                inputFields[0].classList.add("success");
            }

            // Validate pin
            if (pin === "") {
                inputFields[1].classList.add("error");
                errorMessage.style.visibility = "visible";
                errorMessage.style.color = "red";
                errorList.push("Pin is required");
            }
            else if (pin.length != 6){
                inputFields[1].classList.add("error");
                errorMessage.style.visibility = "visible";
                errorMessage.style.color = "red";
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
                    "Content-Type": "application/json"
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
                errorMessage.style.color = "green";
                errorMessage.textContent = "Authenticated successfully";

                sessionStorage.setItem("token", data.token);   // Store user data in session storage
                sessionStorage.setItem("profileId", data.profileId);

                alert("User Authenticated successfully");
                console.log("User Authenticated successfully");

                /*
                // Accessing Email property of the user object stored in session storage

                const storedUser = JSON.parse(sessionStorage.getItem("Account"));
                console.log(storedUser.Email);
                */

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
                errorMessage.style.color = "red";
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
                errorMessage.style.color = "red";
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
            },
        });
        const data = await response.json();
        console.log(data)
        document.getElementById('user-name').innerText = data.FullName;

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
            },
        });
        const data = await response.json();
        console.log(data)
        document.getElementById('account-type').innerText = data.AccType;
        document.getElementById('account-no').innerText = data.AccNum;
        document.getElementById('account-balance').innerText = `$${data.Balance.toFixed(2)}`;

        // Set the session storgae
        sessionStorage.setItem('AccNum', data.AccNum);
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
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);

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
                    amountDisplay = `Amount: -$${transaction.TransactAmount}`;
                    amountColor = 'black';
                } else {
                    amountDisplay = `Amount: +$${transaction.TransactAmount}`;
                    amountColor = 'green';
                }

                const transactionCard = document.createElement('div');
                transactionCard.className = 'transaction-card';

                transactionCard.innerHTML = `
                   <div class="transaction-title-container">
                        <h2 class="transaction-title">Transaction No: ${transaction.TransactNo}</h2>
                        <i class="fa fa-volume-up speaker-icon" 
                        onclick="speak('${transaction.TransactAmount} dollars has been sent from ${transaction.SenderName} to ${transaction.ReceiverName} on ${transaction.TransactDate}')"></i>
                    </div>

                    <p class="transaction-from">
                        <strong>From:</strong> ${transaction.SenderName}
                    </p>
                    <p class="transaction-to">
                        <strong>To:</strong> ${transaction.ReceiverName}
                    </p>
                    <p class="transaction-date">
                        <strong>Date:</strong> ${transaction.TransactDate}
                    </p>
                    <div class="transaction-amount" style="color: ${amountColor};">${amountDisplay}</div>
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





