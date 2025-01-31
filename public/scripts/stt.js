let recognition;
let transcriptionActive = false;

function closeLanguagePopup() {
    document.getElementById('language-overlay').style.display = 'none';
    document.getElementById('mic-overlay').style.display = 'none';
    document.getElementById('stop-button').style.display = 'none';
    document.getElementById('mic-icon').style.display = 'flex'; // Ensure mic icon remains visible

    if (transcriptionActive) {
        transcriptionActive = false;
        recognition.stop(); // Stop speech recognition if active
    }

    document.getElementById('transcription').innerText = ''; // Clear transcription text
}

window.closeLanguagePopup = closeLanguagePopup;

function startTranscription() {
    document.getElementById("language-overlay").style.display = "block";
}

window.startTranscription = startTranscription;

function selectLanguage(languageCode) {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
        alert("Speech Recognition is not supported in this browser.");
        return;
    }

    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = languageCode;
    recognition.continuous = true;
    recognition.interimResults = false;
    
    document.getElementById("language-overlay").style.display = "none";
    document.getElementById("mic-overlay").style.display = "block";
    document.getElementById("stop-button").style.display = "flex";
    document.getElementById("mic-icon").style.display = "none";

    transcriptionActive = true;
    recognition.start();

    recognition.onresult = async (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        document.getElementById('transcription').innerText += transcript + ' ';
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopTranscription();
    };
}

window.selectLanguage = selectLanguage;

async function stopTranscription() {
    if (transcriptionActive) {
        transcriptionActive = false;
        recognition.stop();

        const lastTranscript = document.getElementById('transcription').innerText.trim();
        const intent = await getIntentFromOpenAI(lastTranscript);

        if (intent === "homepage") {
            window.location.href = '../homepage/homepage.html';
        } else if (intent === "history") {
            window.location.href = '../view-transaction-pages/view-transaction-history.html';
        } else if (intent === "chatbot") {
            window.location.href = '../chatbot/ibm-chatbot.html';
        } else if (intent === "transfer") {
            window.location.href = '../transaction/transaction.html';
        } else if (intent === "bills") {
            window.location.href = '../pay-bills/view-bills.html';
        } else if (intent === "forum") {
            window.location.href = '../forum/ForumHome.html';
        } else if (intent === "previous page") {
            window.history.back();
        } else if (intent === "helpline") {
            try {
                const response = await fetch('/video-calling/create-room', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();
                console.log('room data: ', data);

                window.open(data.roomUrl, '_blank');    // Open the video call page in a new tab
                
                if (response.ok) {
                    try{
                        await fetch('/video-calling/send-host-url', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                            },
                            body: JSON.stringify({
                                data: data
                            })
                        });
                    }catch(error){
                        console.log('Error:', error);
                    }
                } else {
                    console.log(data.message);
                    alert('Failed to create video calling room. Try again later.');
                }
            } catch (error) {
                console.log('Error:', error);
            }
        } else {
            console.error("Unrecognized intent: ", intent);
        }

        document.getElementById("mic-overlay").style.display = "none";
        document.getElementById("stop-button").style.display = "none";
        document.getElementById("mic-icon").style.display = "flex";

        document.getElementById('transcription').innerText = '';
    }
}

async function getIntentFromOpenAI(inputText) {
  try {
    const response = await fetch("/get-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: inputText })
    });

    const data = await response.json();
    console.log("Intent from OpenAI:", data);
    return data.intent?.trim() || "error";
  } catch (error) {
    console.error("Error communicating with OpenAI API:", error);
    return "error";
  }
}

function speak(text) {
    const msg = new SpeechSynthesisUtterance();
    msg.text = text;
    msg.lang = 'en-SG';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
}

window.speak = speak;

console.log("Script Loaded Successfully!");
