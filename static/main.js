const chatMessagesDiv = document.getElementById("chat-messages");
const userInputElem = document.getElementById("user-input");

const settingsButton = document.getElementById("settings-toggle");
const settingsDropdown = document.querySelector(".settings-dropdown");

const modelToggle = document.getElementById("model-toggle");
const modelLabel = document.getElementById("model-label");
let modelName = modelToggle.checked ? "gpt-4" : "gpt-3.5-turbo";

let messages = [];
let systemMessageRef = null;
let autoScrollState = true;

modelToggle.addEventListener("change", function () {
  if (modelToggle.checked) {
    modelLabel.textContent = "GPT-4";
    modelName = "gpt-4";
  } else {
    modelLabel.textContent = "GPT-3.5";
    modelName = "gpt-3.5-turbo";
  }
});

function toggleDropdownDisplay() {
  settingsDropdown.style.display =
    settingsDropdown.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", (event) => {
  const clickInsideDropdown = settingsDropdown.contains(event.target);
  const clickOnSettingsButton = settingsButton.contains(event.target);

  if (!clickInsideDropdown && !clickOnSettingsButton) {
    settingsDropdown.style.display = "none";
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

window.renderMarkdown = function (content) {
  const md = new markdownit();
  return md.render(content);
};

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
    messageText.innerHTML = window.renderMarkdown(assistantMessage).trim();
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

      // Check if the system message has changed
      if (systemMessage &&
        (!systemMessageRef || systemMessage !== systemMessageRef.content)
      ) {
        // Find the index of the system message in the messages array
        let systemMessageIndex = messages.findIndex(
          (message) => message.role === "system"
        );

        // If the system message exists in the messages array, remove it
        if (systemMessageIndex !== -1) {
          messages.splice(systemMessageIndex, 1);
        }

        // Add new systemMessage to the end of the messages array
        systemMessageRef = { role: "system", content: systemMessage };
        messages.push(systemMessageRef);
      }

      messages.push({ role: "user", content: userInput });
      addMessageToDiv("user", userInput, "user-input");

      // FIXME: handle this in addMessageToDiv function
      let messageDiv = document.createElement("div");
      messageDiv.className = "message assistant-message";
      let messageText = document.createElement("p");
      messageDiv.appendChild(messageText);
      chatMessagesDiv.appendChild(messageDiv);
      autoScroll();

      const response = await fetch("/gpt4", {
        method: "POST",
        body: JSON.stringify({
          messages: messages,
          model_type: modelName,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      handleResponse(response, messageText);

      // FIXME: Move this to happen after user input is sent, not after assitant message is received
      userInputElem.value = "";
    });
};
