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
            window.location.href = homePage;
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