let messages = [];

// Create and append a message element to the chat-messages div
function addMessageToResultDiv(role, content) {
  let chatMessagesDiv = document.getElementById("chat-messages");
  let messageDiv = document.createElement("div");
  messageDiv.className =
    role === "user" ? "message user-message" : "message assistant-message";

  // Create element, append it to the message div, and add message content to it
  let messageText = document.createElement("p");
  messageText.textContent = content;
  messageDiv.appendChild(messageText);

  chatMessagesDiv.appendChild(messageDiv);
  scrollToBottom();
}

function scrollToBottom() {
  let chatMessagesDiv = document.getElementById("chat-messages");
  chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}

window.onload = function () {
  document
    .getElementById("chat-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      let userInput = document.getElementById("user-input").value;
      let url = `/gpt4`;

      messages.push({ role: "user", content: userInput });
      addMessageToResultDiv("user", userInput, "user-input");

      // Make a POST request to the GPT-4 API endpoint with the user's input and messages array
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_input: userInput,
          messages: messages,
        }),
      })
        // Get the JSON response from the API
        .then(async (response) => {
          const jsonResponse = await response.json();
          let assistantResponse = "";

          // Concatenate the content of each chunk in the JSON response
          jsonResponse.forEach((chunk) => {
            if (chunk.content) {
              assistantResponse += chunk.content;
            }
          });

          // Add the assistant's response to the chat-messages div
          addMessageToResultDiv(
            "assistant",
            assistantResponse,
            "assistant-response"
          );

          // Add the assistant's response to the messages array
          messages.push({
            role: "assistant",
            content: assistantResponse,
          });
        })
        .catch((error) => {
          console.error("Error fetching GPT-4 response:", error);
        });
      // Clear the user input field
      document.getElementById("user-input").value = "";
    });
};
