console.log("Crunchyroll Auto-Skip (Iframe Script) Loaded");

let autoSkipEnabled = false;

// Function to find the #vilos element
function detectVilosPlayer() {
    // Load the stored setting
    chrome.storage.sync.get("autoSkipEnabled", (data) => {
        autoSkipEnabled = data.autoSkipEnabled ?? true; // Default to true
    });
    if (!autoSkipEnabled) return; // Exit if disabled
    const skipButton = document.querySelector('[data-testid="skipIntroText"]');

    if (skipButton) {
        console.log("✅ Found SkipButton inside iframe:", skipButton);
        skipButton.click();
    } else {
        console.log("⛔ SkipButton not found inside iframe.");
    }
}

// Listen for toggle events
chrome.runtime.onMessage.addListener((message) => {
    if (message.autoSkipEnabled !== undefined) {
        autoSkipEnabled = message.autoSkipEnabled;
        console.log(`Auto-Skip ${autoSkipEnabled ? "Enabled" : "Disabled"}`);
    }
});


// Run once and periodically check in case the player loads late
setTimeout(detectVilosPlayer, 3000);
setInterval(detectVilosPlayer, 2000);
