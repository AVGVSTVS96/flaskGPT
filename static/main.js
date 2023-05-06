let messages = [];

// Create element, append it to the message div, and add message content to it
function addMessageToResultDiv(role, content) {
  let chatMessagesDiv = document.getElementById("chat-messages");
  let messageDiv = document.createElement("div");
  messageDiv.className =
    role === "user" ? "message user-message" : "message assistant-message";

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
      let url = `/gpt4?user_input=${encodeURIComponent(
        userInput
      )}&messages=${encodeURIComponent(JSON.stringify(messages))}`;

      messages.push({ role: "user", content: userInput });
      addMessageToResultDiv("user", userInput, "user-input");

      // Create a new message container for the assistant's response
      let chatMessagesDiv = document.getElementById("chat-messages");
      let messageDiv = document.createElement("div");
      messageDiv.className = "message assistant-message";
      let messageText = document.createElement("p");
      messageDiv.appendChild(messageText);
      chatMessagesDiv.appendChild(messageDiv);
      scrollToBottom();

      let source = new EventSource(url);

      source.onmessage = function (event) {
        if (event.data === "[DONE]") {
          source.close();
          messages.push({
            role: "assistant",
            content: messageText.textContent,
          });
        } else {
          // Append the chunk to the current assistant message container
          messageText.textContent += event.data;
          scrollToBottom();
        }
      };

      source.onerror = function (event) {
        source.close();
        console.error("Error fetching GPT-4 response:", event);
      };

      // Clear the user input field
      document.getElementById("user-input").value = "";
    });
};
