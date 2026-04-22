console.log("Crunchyroll Auto-Skip script loaded");

let autoSkipEnabled = false;
let observer = null;

// Track recent clicks so we do not repeatedly click the same button every mutation tick.
const recentlyClickedButtons = new WeakMap();
const CLICK_COOLDOWN_MS = 3000;

function now() {
    return Date.now();
}

function isWithinCooldown(button) {
    const lastClickedAt = recentlyClickedButtons.get(button);
    return Boolean(lastClickedAt && (now() - lastClickedAt) < CLICK_COOLDOWN_MS);
}

function markClicked(button) {
    recentlyClickedButtons.set(button, now());
}

function isVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0" &&
        rect.width > 0 &&
        rect.height > 0
    );
}

function normalizeText(text) {
    return (text || "").trim().toLowerCase();
}

function isSkipLikeButton(button) {
    if (!button) return false;

    const ariaLabel = normalizeText(button.getAttribute("aria-label"));
    const textContent = normalizeText(button.textContent);
    const dataTestId = normalizeText(button.getAttribute("data-testid"));

    // Hard guard: never auto-click next episode controls.
    if (ariaLabel.includes("next episode") || dataTestId.includes("next-episode")) {
        return false;
    }

    const patterns = ["skip intro", "skip recap", "skip credits", "skip opening"];

    // Match explicit skip labels only.
    if (patterns.some((pattern) => ariaLabel.includes(pattern) || textContent.includes(pattern))) {
        return true;
    }

    // Fallback for variants like "Skip Ad" / "Skip" while still excluding "Next Episode".
    const startsWithSkip = ariaLabel.startsWith("skip") || textContent.startsWith("skip");
    return startsWithSkip;
}

function getSkipButtons() {
    const candidates = new Set();

    // Current Crunchyroll UI often labels actionable buttons with aria-label text.
    document.querySelectorAll('button[aria-label*="Skip"], button[aria-label*="skip"]').forEach((btn) => {
        candidates.add(btn);
    });

    // Fallback: some buttons include skip icon testid in descendants.
    document.querySelectorAll('[data-testid="skip-intro-icon"]').forEach((icon) => {
        const button = icon.closest("button");
        if (button) candidates.add(button);
    });

    // Generic fallback: scan buttons and match text.
    document.querySelectorAll("button").forEach((btn) => {
        if (isSkipLikeButton(btn)) candidates.add(btn);
    });

    return Array.from(candidates);
}

function clickSkipButtons() {
    if (!autoSkipEnabled) return;

    const buttons = getSkipButtons();
    for (const button of buttons) {
        if (!isVisible(button)) continue;
        if (!isSkipLikeButton(button)) continue;
        if (isWithinCooldown(button)) continue;

        button.click();
        markClicked(button);
        console.log("Clicked skip-like button:", button.getAttribute("aria-label") || button.textContent?.trim());
    }
}

function startObserver() {
    if (observer) return;

    observer = new MutationObserver(() => {
        clickSkipButtons();
    });

    observer.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["aria-label", "class", "style", "hidden"]
    });
}

function stopObserver() {
    if (!observer) return;
    observer.disconnect();
    observer = null;
}

function applyAutoSkipState(enabled) {
    autoSkipEnabled = Boolean(enabled);
    console.log(`Auto-Skip ${autoSkipEnabled ? "Enabled" : "Disabled"}`);

    if (autoSkipEnabled) {
        startObserver();
        clickSkipButtons();
    } else {
        stopObserver();
    }
}

function init() {
    chrome.storage.sync.get("autoSkipEnabled", (data) => {
        applyAutoSkipState(Boolean(data.autoSkipEnabled));
    });
}

// Listen for toggle events from popup/background.
chrome.runtime.onMessage.addListener((message) => {
    if (message && message.autoSkipEnabled !== undefined) {
        applyAutoSkipState(message.autoSkipEnabled);
    }
});

// Fallback poll in case UI updates are not emitted in observed subtree.
setInterval(() => {
    clickSkipButtons();
}, 1500);

init();
