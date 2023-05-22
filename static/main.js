const chatMessagesDiv = document.getElementById("chat-messages");
const userInputElem = document.getElementById("user-input");
const settingsButton = document.getElementById("settings-toggle");
const settingsDropdown = document.querySelector(".settings-dropdown");
const modelToggle = document.getElementById("model-toggle");
const modelLabel = document.getElementById("model-label");

// State variables
let modelName = modelToggle.checked ? "gpt-4" : "gpt-3.5-turbo";
let messages = [];
let systemMessageRef = null;
let autoScrollState = true;

function toggleDropdownDisplay() {
  settingsDropdown.style.display =
    settingsDropdown.style.display === "block" ? "none" : "block";
}

// Event listener functions
function handleModelToggle() {
  if (modelToggle.checked) {
    modelLabel.textContent = "GPT-4";
    modelName = "gpt-4";
  } else {
    modelLabel.textContent = "GPT-3.5";
    modelName = "gpt-3.5-turbo";
  }
}

function closeDropdown(event) {
  const clickInsideDropdown = settingsDropdown.contains(event.target);
  const clickOnSettingsButton = settingsButton.contains(event.target);

  if (!clickInsideDropdown && !clickOnSettingsButton) {
    settingsDropdown.style.display = "none";
  } else if (clickOnSettingsButton) {
    toggleDropdownDisplay();
  }
}

function handleInputKeydown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    document.getElementById("submitBtn").click();
  }
}

// Event listeners for functions above
modelToggle.addEventListener("change", handleModelToggle);
document.addEventListener("click", closeDropdown);
document.getElementById("user-input").addEventListener("keydown", handleInputKeydown);

window.renderMarkdown = function (content) {
  const md = new markdownit();
  return md.render(content);
};

function highlightCode(element) {
  const codeElements = element.querySelectorAll("pre code");
  codeElements.forEach((codeElement) => {
    hljs.highlightElement(codeElement);
  });
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

function addMessageToDiv(role, content = "") {
  let messageDiv = document.createElement("div");
  messageDiv.className =
    role === "user" ? "message user-message" : "message assistant-message";

  let messageText = document.createElement("p");
  messageDiv.appendChild(messageText);

  if (content) {
    let renderedContent = window.renderMarkdown(content).trim();
    messageText.innerHTML = renderedContent;
    highlightCode(messageDiv);
  }

  chatMessagesDiv.appendChild(messageDiv);
  autoScroll();

  return messageText;
}

function updateSystemMessage(systemMessage) {
  if (
    systemMessage &&
    (!systemMessageRef || systemMessage !== systemMessageRef.content)
  ) {
    let systemMessageIndex = messages.findIndex((message) => message.role === "system");
    // If the system message exists in array, remove it
    if (systemMessageIndex !== -1) {
      messages.splice(systemMessageIndex, 1);
    }
    systemMessageRef = { role: "system", content: systemMessage };
    messages.push(systemMessageRef);
  }
}

async function postRequest() {
  return await fetch("/gpt4", {
    method: "POST",
    body: JSON.stringify({
      messages: messages,
      model_type: modelName,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

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
    highlightCode(messageText);
    autoScroll();
  }
}

window.onload = function () {
  document.getElementById("chat-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    let userInput = userInputElem.value.trim();
    let systemMessage = document.getElementById("system-message").value.trim();

    updateSystemMessage(systemMessage);

    messages.push({ role: "user", content: userInput });
    addMessageToDiv("user", userInput);
    userInputElem.value = "";

    let messageText = addMessageToDiv("assistant");

    const response = await postRequest();

    handleResponse(response, messageText);
  });
};
