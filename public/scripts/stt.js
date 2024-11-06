/*--------------------------------  Sairam Functions --------------------------------*/
// Close the langauge overaly if 
function closeLanguagePopup(){
    document.getElementById('language-overlay').style.display = 'none';
}

let recognition;
let transcriptionActive = false;

function startTranscription() {
    // Show the language overlay when the mic is clicked
    document.getElementById("language-overlay").style.display = "block";
}

function selectLanguage(languageCode) {
    // Set up Speech Recognition with the selected language
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = languageCode;

    // Hide the language overlay and show the transcription UI
    document.getElementById("language-overlay").style.display = "none";
    document.getElementById("mic-overlay").style.display = "block";
    document.getElementById("stop-button").style.display = "flex";
    document.getElementById("mic-icon").style.display = "none";

    transcriptionActive = true;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.start();

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        document.getElementById('transcription').innerText += transcript + ' ';
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopTranscription();
    };
}

function stopTranscription() {
    if (transcriptionActive) {
        transcriptionActive = false;
        recognition.stop(); // Stop recognition

        // Perform actions based on the last command or state
        const lastTranscript = document.getElementById('transcription').innerText.trim();
        if (lastTranscript.toLowerCase().includes('homepage'))  {
             window.location.href = '../homepage/homepage.html'
        } else if (lastTranscript.toLowerCase().includes('view transaction history')) {
           window.location.href = '../view-transaction-pages/view-transaction-history.html'
        } else if (lastTranscript.toLowerCase().includes('chatbot')) {
            window.location.href = '../chatbot/chatbot.html'
        } else if (lastTranscript.toLowerCase().includes('transfer')) {
            window.location.href = ''
        } 

        document.getElementById("mic-overlay").style.display = "none";
        document.getElementById("stop-button").style.display = "none";
        document.getElementById("mic-icon").style.display = "flex"; // Show the mic icon again

        // Clear the transcription
        document.getElementById('transcription').innerText = '';
    }
}
     // Function to do speech text
function speak(text) {
    const msg = new SpeechSynthesisUtterance();
    console.log(text)
    msg.text = text;
    msg.lang = 'en-SG';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
}
