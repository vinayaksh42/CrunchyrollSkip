console.log("Crunchyroll Auto-Skip Extension Loaded");

let autoskipEnabled = false;

// Load the stored setting
chrome.storage.sync.get("autoSkipEnabled", (data) => {
    autoSkipEnabled = data.autoSkipEnabled ?? true; // Default to true
});

// Function to inject a script into the iframe
function injectScriptIntoIframe() {
    if (!autoSkipEnabled) return; // Exit if disabled
    const iframe = document.querySelector("iframe.video-player");
    if (!iframe) {
        console.log("⛔ Iframe not found, retrying...");
        setTimeout(injectScriptIntoIframe, 2000);
        return;
    }

    // Create script element
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("iframeScript.js"); // Load iframeScript.js
    script.onload = () => script.remove(); // Remove script after execution

    iframe.contentWindow.document.documentElement.appendChild(script);
    console.log("✅ Script injected into iframe!");
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.autoSkipEnabled !== undefined) {
        autoSkipEnabled = message.autoSkipEnabled;
        console.log(`Auto-Skip ${autoSkipEnabled ? "Enabled" : "Disabled"}`);
    }
});


// Wait for page to load and then inject script
setTimeout(injectScriptIntoIframe, 3000);
