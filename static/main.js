let messages = [];
let autoScroll = true;

const chatMessagesDiv = document.getElementById("chat-messages");
const userInputElem = document.getElementById("user-input");

function addMessageToResultDiv(role, content) {
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
  if (autoScroll) {
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
  }
}

document
  .getElementById("chat-messages")
  .addEventListener("scroll", function () {
    const isAtBottom =
      chatMessagesDiv.scrollHeight - chatMessagesDiv.clientHeight <=
      chatMessagesDiv.scrollTop + 1;

    autoScroll = isAtBottom;
  });

async function handleResponse(response, messageText) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      messages.push({
        role: "assistant",
        content: messageText.textContent,
      });
      break;
    }

    const text = decoder.decode(value);
    messageText.textContent += text;
    scrollToBottom();
  }
}

window.onload = function () {
  document
    .getElementById("chat-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      let userInput = userInputElem.value;

      messages.push({ role: "user", content: userInput });
      addMessageToResultDiv("user", userInput, "user-input");

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

      userInputElem.value = "";
    });
};
