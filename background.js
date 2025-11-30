// --- Helper Function: Perform the Search ---
function performSearch(ticker, active) {
    if (!ticker) return;
    const trimmedTicker = ticker.trim().toUpperCase();
    if (trimmedTicker) {
      const url = `https://www.gurufocus.com/stock/${trimmedTicker}/summary`;
      // Note: The `active: false` property to open tabs in the background is
      // dependent on the browser's implementation. It is known to work in
      // Chrome, but may not work as expected in all Chromium-based browsers.
      chrome.tabs.create({ url, active });
    }
  }
  
  // --- Helper Function to get selection and search ---
async function getSelectionAndSearch(tab, active) {
  if (!tab.id) return;
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString()
    });
    const selectedText = results?.[0]?.result;
    if (selectedText) {
      performSearch(selectedText, active);
    } else {
      console.log("No text selected.");
    }
  } catch (err) {
    chrome.notifications.create({
      type: 'basic',
      title: 'GuruFocus Extension Error',
      message: "Could not get selected text from the current page."
    });
    console.error("Failed to get selection:", err);
  }
}
  
  // 1. Listen for Context Menu (Right-Click)
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "gurufocus-search",
      title: "Search on GuruFocus",
      contexts: ["selection"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "gurufocus-search" && info.selectionText) {
      performSearch(info.selectionText, true);
    }
  });
  
  // 2. Listen for Keyboard Shortcut
  chrome.commands.onCommand.addListener((command, tab) => {
    if (command === "gurufocus-search-shortcut") {
      getSelectionAndSearch(tab, true);
    } else if (command === "gurufocus-search-shortcut-background") {
      getSelectionAndSearch(tab, false);
    }
  });
  
  // 3. Listen for Toolbar Icon Click
  chrome.action.onClicked.addListener((tab) => {
    getSelectionAndSearch(tab, true);
  });