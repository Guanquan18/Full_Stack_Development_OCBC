document.getElementById('click_to_convert').addEventListener('click', function() {
    var speech = true;
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.interimResults = true; // Enable interim results for real-time display

    let finalTranscript = '';  // Accumulate the final confirmed transcript
    let userInput = document.getElementById('userInput');
    let existingInput = userInput.value; // Store existing input to prevent duplication

    recognition.addEventListener('result', e => {
        let interimTranscript = '';  // To store interim results for live display

        // Loop through the results and handle both final and interim results
        for (let i = 0; i < e.results.length; i++) {
            const transcript = e.results[i][0].transcript;
            if (e.results[i].isFinal) {
                finalTranscript += transcript;  // Accumulate the final results
            } else {
                interimTranscript += transcript;  // Display interim results live
            }
        }

        // Temporarily display both the current input, final transcript, and interim transcript
        userInput.value = existingInput + finalTranscript + interimTranscript;

        // Move cursor to the end of the current input
        userInput.focus();
        userInput.selectionStart = userInput.selectionEnd = userInput.value.length;
    });

    // When the mic stops (recognition ends), append only the final transcript
    recognition.addEventListener('end', () => {
        // Append the final transcript with a space to separate it from the previous content
        userInput.value = (existingInput + " " + finalTranscript).trim();  // Ensure proper spacing
        finalTranscript = '';  // Reset the final transcript for the next session
        existingInput = userInput.value;  // Update the existing input to include new content

        // Move cursor to the end of the final input
        userInput.selectionStart = userInput.selectionEnd = userInput.value.length;
    });

    if (speech === true) {
        recognition.start();  // Start speech recognition
    }
});
