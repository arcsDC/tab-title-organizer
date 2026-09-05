chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: "OK" });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    updateBadge();
  }
});

chrome.tabs.onRemoved.addListener(() => {
  updateBadge();
});

chrome.tabs.onCreated.addListener(() => {
  updateBadge();
});

function updateBadge() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const count = tabs.length;
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getTabs") {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const organized = tabs
        .filter(tab => tab.url && !tab.url.startsWith("chrome://"))
        .map(tab => {
          let domain = "unknown";
          try {
            domain = new URL(tab.url).hostname.replace(/^www\./, "");
          } catch (e) {
            domain = "unknown";
          }
          return {
            title: tab.title || "Untitled",
            domain: domain,
            id: tab.id
          };
        })
        .sort((a, b) => {
          if (a.domain === b.domain) {
            return a.title.localeCompare(b.title);
          }
          return a.domain.localeCompare(b.domain);
        });
      sendResponse({ tabs: organized });
    });
    return true;
  }
});
