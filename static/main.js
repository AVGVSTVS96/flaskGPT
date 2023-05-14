let messages = [];
let autoScrollState = true;

const chatMessagesDiv = document.getElementById("chat-messages");
const userInputElem = document.getElementById("user-input");

window.renderMarkdown = function (content) {
  const md = new markdownit();
  return md.render(content);
};

const settingsButton = document.getElementById('settings-toggle');
const settingsDropdown = document.querySelector('.settings-dropdown');

function toggleDropdownDisplay() {
  settingsDropdown.style.display = settingsDropdown.style.display === 'block' ? 'none' : 'block';
}

document.addEventListener('click', (event) => {
  const clickInsideDropdown = settingsDropdown.contains(event.target);
  const clickOnSettingsButton = settingsButton.contains(event.target);
  
  if (!clickInsideDropdown && !clickOnSettingsButton) {
    settingsDropdown.style.display = 'none';
  } else if (clickOnSettingsButton) {
    toggleDropdownDisplay();
  }
});

document
  .getElementById("user-input")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      document.getElementById("submitBtn").click();
    }
  });

function addMessageToDiv(role, content) {
  let messageDiv = document.createElement("div");
  messageDiv.className =
    role === "user" ? "message user-message" : "message assistant-message";

  let renderedContent = window.renderMarkdown(content).trim();
  messageDiv.innerHTML = renderedContent;

  chatMessagesDiv.appendChild(messageDiv);
  const codeElements = messageDiv.querySelectorAll("pre code");
  codeElements.forEach((codeElement) => {
    hljs.highlightElement(codeElement);
  });
  autoScroll();
}

function autoScroll() {
  if (autoScrollState) {
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
  }
}

document;
chatMessagesDiv.addEventListener("scroll", function () {
  const isAtBottom =
    chatMessagesDiv.scrollHeight - chatMessagesDiv.clientHeight <=
    chatMessagesDiv.scrollTop + 1;

  autoScrollState = isAtBottom;
});

async function handleResponse(response, messageText) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let assistantMessage = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      messages.push({
        role: "assistant",
        content: assistantMessage,
      });
      break;
    }

    const text = decoder.decode(value);
    assistantMessage += text;
    messageText.innerHTML = window.renderMarkdown(assistantMessage).trim(); // Render the markdown content as HTML using 'markdown-it' library while streaming
    const codeElements = messageText.querySelectorAll("pre code");
    codeElements.forEach((codeElement) => {
      hljs.highlightElement(codeElement);
    });
    autoScroll();
  }
}

window.onload = function () {
  document
    .getElementById("chat-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      let userInput = userInputElem.value.trim();
      let systemMessage = document.getElementById("system-message").value.trim();
      let modelType = document.getElementById("model-type").value;
      
      messages.push({ role: "user", content: userInput });
      addMessageToDiv("user", userInput, "user-input");

      let messageDiv = document.createElement("div");
      messageDiv.className = "message assistant-message";
      let messageText = document.createElement("p");
      messageDiv.appendChild(messageText);
      chatMessagesDiv.appendChild(messageDiv);
      autoScroll();

      const response = await fetch("/gpt4", {
        method: "POST",
        body: JSON.stringify({
          user_input: userInput,
          messages: messages,
          system_message: systemMessage, 
          model_type: modelType,  
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      handleResponse(response, messageText);

      userInputElem.value = "";
    });
};
