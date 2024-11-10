// popup.js - defines behavior for the popup/user interface

document.addEventListener("DOMContentLoaded", function () {
  let CHROME_STORAGE_VAR = "atsp_settings";
  let settingNodes = $(".setting-node");

  // Add a toggle for enabling/disabling live feedback
  const liveFeedbackToggle = document.createElement("input");
  liveFeedbackToggle.type = "checkbox";
  liveFeedbackToggle.id = "liveFeedbackToggle";
  liveFeedbackToggle.checked = false; // Default state (off)

  const liveFeedbackLabel = document.createElement("label");
  liveFeedbackLabel.setAttribute("for", "liveFeedbackToggle");
  liveFeedbackLabel.innerText = "Enable Live Feedback";

  document.body.appendChild(liveFeedbackLabel);
  document.body.appendChild(liveFeedbackToggle);

  // Store the live feedback setting when toggled
  liveFeedbackToggle.addEventListener("change", function () {
    const settings = {};
    settings.liveFeedbackEnabled = liveFeedbackToggle.checked;

    chrome.storage.sync.set({ [CHROME_STORAGE_VAR]: settings }, function () {
      chrome.runtime.sendMessage({
        from: "extension",
        settings,
      });
    });
  });
});
