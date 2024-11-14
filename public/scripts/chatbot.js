// Created By: Cheong Zhi Xun (S10260423C)
window.watsonAssistantChatOptions = {
    integrationID: "9ef3057f-a2cb-414e-9859-c70216dd3c85", // The ID of this integration.
    region: "us-south", // The region your integration is hosted in.
    serviceInstanceID: "dd762ac3-8156-4f36-89e0-74101a9dc428", // The ID of your service instance.
    onLoad: async (instance) => {
        // The instance returned here has many methods on it that are documented on this page. You can assign it to any
        // global window variable you like if you need to access it in other functions in your application. This instance
        // is also passed as an argument to all event handlers when web chat fires an event.
        window.webChatInstance = instance;

        await instance.render();
        instance.openWindow(); // Automatically open the chat window


        // Delay the display of the terminate prompt
        setTimeout(function() {
            document.querySelector('.terminate').style.display = 'flex';
        }, 2000);
    }
};

setTimeout(function(){
    const t = document.createElement('script');
    t.src = 'https://web-chat.global.assistant.watson.appdomain.cloud/versions/' + (window.watsonAssistantChatOptions.clientVersion || 'latest') + '/WatsonAssistantChatEntry.js';
    document.head.appendChild(t);
});

function restartAndGoBack() {
    const instance = window.webChatInstance; // Access the Watson Assistant instance
    if (instance) {
        instance.restartConversation(); // Restart the conversation
    }
    window.history.back(); // Go back to the previous page
}

function saveAndGoBack() {
    const instance = window.webChatInstance; // Access the Watson Assistant instance
    window.history.back(); // Go back to the previous page
}

function openChatBot() {
    const instance = window.webChatInstance; // Access the Watson Assistant instance
    if (instance) {
        instance.openWindow(); // Open the chat window
    }
}

