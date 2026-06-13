let currentClient = null;

export function setCurrentClient(userAgent) {
  if (!userAgent) {
    currentClient = null;
    return;
  }
  const ua = userAgent.toLowerCase();
  if (ua.includes("openai")) {
    currentClient = "chatgpt";
  } else if (ua.includes("claude")) {
    currentClient = "claude";
  } else {
    currentClient = "unknown";
  }
}

export function getCurrentClient() {
  return currentClient;
}

export function isClaude() {
  return currentClient === "claude";
}

export function isChatGPT() {
  return currentClient === "chatgpt";
}
