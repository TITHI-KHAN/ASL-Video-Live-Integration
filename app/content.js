// content.js - modifies and adds behaviors to the active tab page

(function main() {
  var originalSentences = {};
  var markedUpSentences = {};
  var replacedSentences = null;
  var extensionSettings = {};
  let FIREBASE_URL = '';
  let CHROME_STORAGE_VAR = "atsp_settings";

  const mainContent = identifyPageMainContent();
  mainContent.classList.add("document");
  mainContent.setAttribute("id", "document0");

  const paragraphs = mainContent.querySelectorAll("p");
  var wordIndex = 0; 
  var sentenceIndex = 0;

  for (var i = 0; i < paragraphs.length; i++) {
    let paragraph = paragraphs[i];
    paragraph.classList.add("paragraph");
    paragraph.setAttribute("id", `paragraph${i}`);
    words = identifyWords(paragraph);
    identifySentences(words);
    paragraph.innerHTML = words.join(" "); 
  }

  document.querySelectorAll('[id*="sentence"]').forEach(function(sentence) {
    markedUpSentences[sentence.id] = sentence.innerHTML;
  });

  chrome.runtime.sendMessage({
    from: "content",
    toSimplify: originalSentences
  });

  chrome.storage.sync.get(CHROME_STORAGE_VAR, function (status) {
    switchingSetting(status[CHROME_STORAGE_VAR], true);
  });

  chrome.runtime.onMessage.addListener(function(request) {
    if (request.from === "extension") {
      switchingSetting(request.settings, request.resets);
    }
  });

  // Add an arrow pointing from ASL video to highlighted word
  function addArrow(node, targetElement) {
    const arrowDiv = document.createElement("div");
    arrowDiv.classList.add("arrow");

    const nodeRect = node.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    arrowDiv.style.position = "absolute";
    arrowDiv.style.left = (nodeRect.left + targetRect.left) / 2 + "px";
    arrowDiv.style.top = (nodeRect.top + targetRect.top) / 2 + "px";

    document.body.appendChild(arrowDiv);
  }

  // Helper function to fetch real-time ASL video from Dr. Alonzo’s system
  function fetchLiveASLVideo(word, targetElement) {
    const liveFeedbackUrl = `https://example-live-feedback-url.com/asl-video?word=${encodeURIComponent(word)}`;

    fetch(liveFeedbackUrl)
      .then(response => response.json())
      .then(data => {
        targetElement.innerHTML = `<video src="${data.videoUrl}" autoplay loop></video>`;
      })
      .catch(error => {
        console.error("Error fetching live ASL video:", error);
      });
  }

  // Modify showToolTip to include arrow and live feedback fetching
  function showToolTip(node, replacement) {
    if (extensionSettings["howLongSetting"] != "Permanent") {
      removeToolTips();
    }

    const id = node.id;
    const tooltipWrap = document.createElement("div");
    splitTextIntoNodes(replacement, tooltipWrap);

    tooltipWrap.classList.add("tooltip1", "replacement");
    tooltipWrap.id = "Popup" + id;

    node.insertBefore(tooltipWrap, node.firstChild);
    bringTooltipToFront(node, [tooltipWrap]);

    // Add arrow pointing from tooltip to word
    addArrow(node, tooltipWrap);

    // Check if live feedback is enabled before fetching
    if (extensionSettings.liveFeedbackEnabled) {
      fetchLiveASLVideo(node.innerText, tooltipWrap);
    }
  }

  // Modify showSideTip to include arrow and live feedback fetching
  function showSideTip(node, replacement) {
    let id = node.id;

    const dialogBox = document.createElement("div");
    if (replacement) {
      const dialogContent = getSideTipContentEl(replacement);
      dialogBox.appendChild(dialogContent);
      dialogBox.setAttribute("id", `sidetip-${id}`);
      dialogBox.classList.add("modal1", "highlight");

      let modalContainer = document.getElementById("modal1-container") || document.createElement("div");
      modalContainer.setAttribute("id", "modal1-container");
      modalContainer.appendChild(dialogBox);
      document.body.insertBefore(modalContainer, document.body.firstChild);

      node.addEventListener("mouseenter", () => dialogBox.classList.add("highlight"));
      node.addEventListener("mouseleave", () => dialogBox.classList.remove("highlight"));

      // Add arrow from dialog to word
      addArrow(node, dialogBox);

      // Check if live feedback is enabled before fetching
      if (extensionSettings.liveFeedbackEnabled) {
        fetchLiveASLVideo(node.innerText, dialogContent);
      }
    } else {
      alert("Error: A simplification wasn't found for this.");
    }
  }

  // Function to handle settings updates from popup.js
  function switchingSetting(new_settings, resets) {
    extensionSettings = new_settings;
    if (resets) {
      clearTextMarkup();
      markupComplexText();
    }
  }

  // Helper functions like identifyPageMainContent, calculateTextDensity, identifyWords, etc.
  // (Keep these helper functions as they are in your original content.js file)

})();
