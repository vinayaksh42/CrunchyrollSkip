document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggleButton");
    const statusBadge = document.getElementById("statusBadge");

    function renderState(isEnabled) {
        toggleButton.textContent = isEnabled ? "Disable Auto-Skip" : "Enable Auto-Skip";
        toggleButton.classList.toggle("off", !isEnabled);

        if (statusBadge) {
            statusBadge.textContent = isEnabled ? "Status: ON" : "Status: OFF";
            statusBadge.classList.toggle("on", isEnabled);
            statusBadge.classList.toggle("off", !isEnabled);
        }
    }

    // Get stored setting
    chrome.storage.sync.get("autoSkipEnabled", (data) => {
        renderState(Boolean(data.autoSkipEnabled));
    });

    // Toggle button click event
    toggleButton.addEventListener("click", () => {
        chrome.storage.sync.get("autoSkipEnabled", (data) => {
            const newStatus = !data.autoSkipEnabled;
            chrome.storage.sync.set({ autoSkipEnabled: newStatus });

            renderState(newStatus);

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
        window.autoSkipEnabled = false;
    } else {
        window.autoSkipEnabled = true;
    }
}
