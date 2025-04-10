document.addEventListener('DOMContentLoaded', () => {
    // Get references to all the necessary HTML elements
    const emailInput = document.getElementById('emailInput');
    const summarizeBtn = document.getElementById('summarizeBtn');
    const summaryOutput = document.getElementById('summaryOutput');
    const tasksOutput = document.getElementById('tasksOutput');
    const sentimentOutput = document.getElementById('sentimentOutput');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorDisplay = document.getElementById('errorDisplay');

    // Add an event listener to the button that triggers when clicked
    summarizeBtn.addEventListener('click', async () => {
        // Get the text from the email input area and remove leading/trailing whitespace
        const emailText = emailInput.value.trim();

        // Check if the input text is empty
        if (!emailText) {
            showError("Please paste some email text before summarizing.");
            return; // Stop the function if input is empty
        }

        // --- Prepare UI for processing ---
        // Clear previous results and show placeholder text
        summaryOutput.textContent = 'Processing...';
        tasksOutput.textContent = 'Processing...';
        sentimentOutput.textContent = 'Processing...';
        // Show the loading indicator by removing the 'hidden' class
        loadingIndicator.classList.remove('hidden');
        // Hide any previous error messages
        hideError();
        // Disable the button to prevent multiple clicks while processing
        summarizeBtn.disabled = true;

        try {
            // --- Make the API call to the backend server ---
            // const response = await fetch('/summarize', { // Backend endpoint URL
            const response = await fetch('/api/summarize', {

                method: 'POST', // HTTP method
                headers: {
                    'Content-Type': 'application/json', // Indicate we're sending JSON data
                },
                // Convert the JavaScript object containing the email text to a JSON string
                body: JSON.stringify({ emailText: emailText }),
            });

            // Hide the loading indicator now that the request is complete
            loadingIndicator.classList.add('hidden');
            // Re-enable the button
            summarizeBtn.disabled = false;

            // Check if the server responded with an error status (e.g., 4xx, 5xx)
            if (!response.ok) {
                 // Try to parse the error message from the server's JSON response
                let errorMsg = `Error: ${response.status} ${response.statusText}`; // Default error message
                try {
                    // Attempt to read the response body as JSON
                    const errorData = await response.json();
                    // Use the specific error message from the backend if available
                    errorMsg = errorData.error || errorMsg;
                    // Include details if the backend provided them
                    if (errorData.details) {
                         errorMsg += ` Details: ${errorData.details}`;
                    }
                } catch (e) {
                    // If the response body isn't JSON or is empty, ignore the parsing error
                    console.log("Could not parse error response as JSON.");
                }
                // Throw an error to be caught by the catch block below
                throw new Error(errorMsg);
            }

            // If the response was successful (status 2xx), parse the JSON data
            const data = await response.json();

            // --- Display the results in the respective output areas ---
            summaryOutput.textContent = data.summary || "No summary generated.";
            tasksOutput.textContent = data.tasks || "No tasks identified.";
            sentimentOutput.textContent = data.sentiment || "Sentiment analysis unavailable.";

        } catch (error) {
            // --- Handle any errors that occurred during the fetch or processing ---
            console.error("Frontend Error:", error); // Log the error to the browser console
            showError(`Failed to get summary: ${error.message}`); // Display user-friendly error message

            // Clear the output areas since there was an error
            summaryOutput.textContent = '';
            tasksOutput.textContent = '';
            sentimentOutput.textContent = '';

            // Ensure loading indicator is hidden and button is enabled even if an error occurred
            loadingIndicator.classList.add('hidden');
            summarizeBtn.disabled = false;
        }
    });

    // --- Helper functions for showing/hiding the error message ---

    function showError(message) {
        errorDisplay.textContent = message; // Set the error text
        errorDisplay.classList.remove('hidden'); // Make the error div visible
    }

    function hideError() {
        errorDisplay.textContent = ''; // Clear the error text
        errorDisplay.classList.add('hidden'); // Make the error div hidden
    }
});