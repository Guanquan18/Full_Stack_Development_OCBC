const userInput = document.getElementById('userInput');
const convoArea = document.querySelector('.chatbot-convo');

// Set the maximum height based on the height for 4 lines
const lineHeight = 24;
const maxHeight = lineHeight * 4;

// Function to adjust textarea height and scroll conversation area
function adjustTextareaHeight() {
    userInput.style.height = 'auto';
    const newHeight = Math.min(userInput.scrollHeight, maxHeight);
    userInput.style.height = `${newHeight}px`;

    // Scroll the convo area to the bottom after adjusting the textarea
    scrollToBottom();
}

// Function to scroll the conversation area to the bottom
function scrollToBottom() {
    convoArea.scrollToBottom;
}


// Listen for input events on the textarea to adjust height and scroll
userInput.addEventListener('input', adjustTextareaHeight);

// Use MutationObserver to detect changes in the convoArea and scroll
const observer = new MutationObserver(scrollToBottom);
observer.observe(convoArea, { childList: true, subtree: true });

// Initial scroll to bottom on load
scrollToBottom();

// Function to auto-resize textarea
function autoResizeTextarea() {
    const textarea = document.getElementById('userInput');
    textarea.style.height = 'auto'; // Reset height to auto
    const newHeight = Math.min(textarea.scrollHeight, maxHeight); // Restrict to max height
    textarea.style.height = `${newHeight}px`; // Set the height to fit the content
}

function appendMessage(text, type, isUser = false, timestamp = null) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + type;

    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = text;

    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'timestamp';
    timestampDiv.textContent = formatTimestamp(timestamp);

    if (isUser) {
        // User message
        messageDiv.appendChild(textDiv);
        messageDiv.appendChild(timestampDiv);
        messageContainer.appendChild(messageDiv);
    } else {
        // Bot message with profile picture
        const profilePic = '<img src="../images/OCBC_Logo.png" alt="Bot" class="profile-pic">';
        messageDiv.appendChild(textDiv);
        messageDiv.appendChild(timestampDiv);
        messageContainer.innerHTML = profilePic; // Add profile picture
        messageContainer.appendChild(messageDiv);
    }

    document.getElementById('conversationArea').appendChild(messageContainer);

    // Scroll to the bottom of the chat area
    const chatArea = document.getElementById('conversationArea');
    chatArea.scrollTop = chatArea.scrollHeight;
}

async function sendMessage() {
    const inputField = document.getElementById('userInput');
    const messageText = inputField.value.trim();

    if (messageText) {
        // Append user message with timestamp
        const currentTimestamp = new Date().getTime();
        appendMessage(messageText, 'user-message', true, currentTimestamp);

        // Clear the input field
        inputField.value = '';
        autoResizeTextarea();

        // Add context to the message
        const contextMessage = `${messageText} (you are a chatbot within the OCBC app. you are helping someone navigate the OCBC mobile app, give step by step instructions which are simple and clear)`;

        try {
            // Send the message to the backend
            const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: contextMessage }),
            });
    
            if (response.ok) {
            const data = await response.json();
            const botResponse = data.response;
            appendMessage(botResponse, 'bot-message', false, currentTimestamp);
            } else {
            console.error('Failed to get response from backend');
            }
        } catch (error) {
            console.error('Error during fetch:', error);
        }
    }
}

// make a container containing 3 buttons
function showButtons() {
    const outerContainer = document.createElement('div');
    outerContainer.className = 'outer-container';

    // Create a button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    // Array of button data (images and text)
    const buttonsData = [
        { class: 'login', image: '../images/chatbot/login.png', text: 'Login' },
        { class: 'bank', image: '../images/chatbot/bank.jpg', text: 'Bank Account' },
        { class: 'transfer', image: '../images/chatbot/transfer.png', text: 'Transfer' }
    ];

    // Create buttons dynamically
    buttonsData.forEach(buttonData => {
        const button = document.createElement('button');
        button.className = 'button';

        // Store button text in a data attribute for later use
        button.dataset.text = buttonData.text;

        // Create image element
        const img = document.createElement('img');
        img.className = buttonData.class;
        img.src = buttonData.image;
        img.alt = `${buttonData.text} Image`;

        // Create text element
        const span = document.createElement('span');
        span.textContent = buttonData.text;

        // Append image and text to the button
        button.appendChild(img);
        button.appendChild(span);

        // Add event listener for button click
        button.addEventListener('click', function() {
            handleButtonClick(this.dataset.text);
        });

        // Append button to the button container
        buttonContainer.appendChild(button);
    });

    // Append button container to the message container
    outerContainer.appendChild(buttonContainer);

    document.getElementById('conversationArea').appendChild(outerContainer);
}

async function handleButtonClick(buttonText) {
    const currentTimestamp = new Date().getTime();
    console.log(buttonText);
    appendMessage(buttonText, 'user-message', true, currentTimestamp);

    const outerContainer = document.createElement('div');
    outerContainer.className = 'outer-container';

    // Create a button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    let botResponseData = []; // Declare the array outside of the if-else blocks

    if (buttonText === 'Login') {
        botResponseData = [
            { class: 'singpass', text: 'Login with SingPass' },
            { class: 'forgot-password', text: 'I forgot my password' },
            { class: 'login-guide', text: 'How do I login?' }
        ];
        appendMessage('What would you like me to help with?', 'bot-message', false, currentTimestamp);
    }
    else if (buttonText === 'Bank Account') {
        botResponseData = [
            { class: 'check-balance', text: 'Check Account Balance' },
            { class: 'open-account', text: 'Open a New Account' }
        ];
        appendMessage('What do you want to do with your bank account?', 'bot-message', false, currentTimestamp);
    }
    else if (buttonText === 'Transfer') {
        botResponseData = [
            { class: 'local-transfer', text: 'Local Transfer' },
            { class: 'international-transfer', text: 'International Transfer' }
        ];
        appendMessage('What type of transfer would you like to make?', 'bot-message', false, currentTimestamp);
    }

    // Ensure botResponseData has content before creating buttons
    if (botResponseData.length > 0) {
        // Create buttons dynamically
        botResponseData.forEach(data => {
            const button = document.createElement('button');
            button.className = 'button';

            // Store button text in a data attribute for later use
            button.dataset.text = data.text;

            // Create text element
            const span = document.createElement('span');
            span.textContent = data.text;

            // Append text to the button
            button.appendChild(span);

            // Add event listener for button click
            button.addEventListener('click', function() {
                console.log("Button clicked: " + this.dataset.text);
                handleSendButtonClick(this.dataset.text); // Recursively handle button clicks
            });

            // Append button to the button container
            buttonContainer.appendChild(button);
        });

        // Append button container to the message container
        outerContainer.appendChild(buttonContainer);

        // Append the outer container to the conversation area
        document.getElementById('conversationArea').appendChild(outerContainer);
    }
}


async function handleSendButtonClick(buttonText) {
    const currentTimestamp = new Date().getTime();
    const messageText = buttonText.toLowerCase();

    console.log(messageText);

    appendMessage(messageText, 'user-message', true, currentTimestamp);
    
    // Add context to the message
    const contextMessage = `${messageText} (give step by step instructions which are simple and clear)`;                     
    
    try {
        // Send the message to the backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: contextMessage }),
            });
                        
            if (response.ok) {
                const data = await response.json();
                const botResponse = data.response;
                appendMessage(botResponse, 'bot-message', false, currentTimestamp);
            } else {
                console.error('Failed to get response from backend');
            }
        } catch (error) {
            console.error('Error during fetch:', error);
        }
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    
    // Get day, month, hours, and minutes
    const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with leading zero if needed
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-11, so add 1) and pad
    const hours = String(date.getHours()).padStart(2, '0'); // Get hours and pad with leading zero if needed
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Get minutes and pad with leading zero if needed

    // Return formatted timestamp
    return `${day}/${month} ${hours}:${minutes}`;
}

// Function to initialize the chatbot
async function initializeChatbot() {
    const initialMessage = `Hello. How can I help you today?`;
    const currentTimestamp = new Date().getTime();
    appendMessage(initialMessage, 'bot-message', false, currentTimestamp);
    }

// Initialize the event listener when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const inputField = document.getElementById('userInput');

    // Resize the textarea as the user types
    inputField.addEventListener('input', autoResizeTextarea);

    // Send the message when Enter key is pressed (and prevent default Enter key behavior)
    inputField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent newline when pressing Enter
            sendMessage(); // Send message on Enter
        }
    });


    // Initialize the chatbot with an initial message
    initializeChatbot();
    // Delay showing the buttons by 3 seconds (3000 milliseconds)
    setTimeout(() => {
        showButtons();
    }, 2000);
});

