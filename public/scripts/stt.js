let recognition;
let transcriptionActive = false;

function closeLanguagePopup() {
    document.getElementById('language-overlay').style.display = 'none';
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
        } else if (intent === "previous page") {
            window.history.back();
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
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer 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`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", 
                    content: `The user is navigating a banking app. Here is the user's interaction: "${inputText}". Read the response and recognize the intent, then output the intent. Here is a list of valid intents. If not in list, output error. {homepage, history, chatbot, transfer, previous page}. Only output the intents given without additional words.`,
        }]
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "error";
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
