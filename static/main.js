let messages = [];

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

async function handleResponse(response, messageText) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    if (text === "[DONE]") {
      messages.push({
        role: "assistant",
        content: messageText.textContent,
      });
    } else {
      messageText.textContent += text;
      scrollToBottom();
    }
  }
}

window.onload = function () {
  document
    .getElementById("chat-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      let userInput = document.getElementById("user-input").value;

      messages.push({ role: "user", content: userInput });
      addMessageToResultDiv("user", userInput, "user-input");

      let chatMessagesDiv = document.getElementById("chat-messages");
      let messageDiv = document.createElement("div");
      messageDiv.className = "message assistant-message";
      let messageText = document.createElement("p");
      messageDiv.appendChild(messageText);
      chatMessagesDiv.appendChild(messageDiv);
      scrollToBottom();

      const response = await fetch("/gpt4", {
        method: "POST",
        body: JSON.stringify({
          user_input: userInput,
          messages: messages,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      handleResponse(response, messageText);

      document.getElementById("user-input").value = "";
    });
};
