let messages = [];

function addMessageToResultDiv(role, content) {
  let chatMessagesDiv = document.getElementById("chat-messages");
  let messageDiv = document.createElement("div");
  messageDiv.className =
    role === "user"
      ? "message user-message"
      : "message assistant-message";

  let messageText = document.createElement("p");
  messageText.textContent = unescape(content.replace(/\\u/g, "%u"));
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
        .then(async (response) => {
          const jsonResponse = await response.json();
          let assistantResponse = "";

          jsonResponse.forEach((chunk) => {
            if (chunk.content) {
              assistantResponse += chunk.content;
            }
          });

          addMessageToResultDiv(
            "assistant",
            assistantResponse,
            "assistant-response"
          );
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