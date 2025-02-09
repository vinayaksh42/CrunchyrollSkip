document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggleButton");

    // Get stored setting
    chrome.storage.sync.get("autoSkipEnabled", (data) => {
        if (data.autoSkipEnabled) {
            toggleButton.textContent = "Disable Auto-Skip";
            toggleButton.classList.remove("off");
        } else {
            toggleButton.textContent = "Enable Auto-Skip";
            toggleButton.classList.add("off");
        }
    });

    // Toggle button click event
    toggleButton.addEventListener("click", () => {
        chrome.storage.sync.get("autoSkipEnabled", (data) => {
            const newStatus = !data.autoSkipEnabled;
            chrome.storage.sync.set({ autoSkipEnabled: newStatus });

            toggleButton.textContent = newStatus ? "Disable Auto-Skip" : "Enable Auto-Skip";
            toggleButton.classList.toggle("off", !newStatus);

            // Send message to content script to enable/disable the feature
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length > 0) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: toggleAutoSkip,
                        args: [newStatus]
                    });
                }
            });
        });
    });
});

// Function to toggle script in the active tab
function toggleAutoSkip(enabled) {
    if (!enabled) {
        console.log("Auto-Skip Disabled");
        window.autoSkipEnabled = false;
    } else {
        console.log("Auto-Skip Enabled");
        window.autoSkipEnabled = true;
    }
}
