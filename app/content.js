// content.js - modifies and adds behaviors to the active tab page

/**
 * This function identifies the element most likely to contain the text on the page.
 * It uses the number of paragraphs (`<p>` tags) and text density (ratio of text to HTML content).
 * @returns {Element} The element with the highest paragraph density, or the body element as a fallback.
 */
function identifyPageMainContent() {
  const allElements = Array.from(document.body.getElementsByTagName('*'));

  let bestElement = null;
  let highestParagraphDensity = 0;

  allElements.forEach(element => {
    const paragraphCount = element.querySelectorAll('p').length;
    const textDensity = calculateTextDensity(element);
    const paragraphDensity = paragraphCount * textDensity;

    if (paragraphDensity > highestParagraphDensity) {
      highestParagraphDensity = paragraphDensity;
      bestElement = element;
    }
  });

  return bestElement ? bestElement : document.querySelector("body");
}

/**
 * Calculates text density (ratio of text content length to HTML content length).
 * @param {Element} element - HTML element to calculate density for.
 * @returns {number} Fraction representing text density of element.
 */

function calculateTextDensity(element) {
  const textContent = element.innerText || '';
  const HTMLContent = element.innerHTML || ''; // Ensure HTMLContent is not undefined
  return HTMLContent.length > 0 ? textContent.length / HTMLContent.length : 0;
}

/**
 * Processes words to identify sentences and wraps them in spans with unique IDs.
 * @param {Array} words - Array of words for the paragraph.
 * @returns {Array} Array of sentence strings wrapped in span tags.
 */
function identifySentences(words) {
  // Assuming sentences are separated by punctuation; adjust logic as needed.
  let sentenceArray = [];
  let sentence = [];
  words.forEach((word, index) => {
    sentence.push(word);
    if (word.endsWith('.') || word.endsWith('!') || word.endsWith('?') || index === words.length - 1) {
      sentenceArray.push(`<span id="sentence${sentenceArray.length}">${sentence.join(" ")}</span>`);
      sentence = [];
    }
  });
  return sentenceArray;
}

/**
 * Splits paragraph content into individual words, wraps each word in a span, and assigns a unique ID.
 * @param {Element} paragraph - The paragraph element to identify words in.
 * @returns {Array} Array of words wrapped in span tags with unique IDs.
 */
function identifyWords(paragraph) {
  const words = paragraph.innerText.split(" ").map((word, index) => {
    return `<span id="word${index}">${word}</span>`;
  });
  return words;
}

// Splits text into span elements and appends them to a wrapper
function splitTextIntoNodes(text, wrapper) {
  const words = text.split(" ");
  words.forEach((word) => {
    const span = document.createElement("span");
    span.textContent = word + " ";
    wrapper.appendChild(span);
  });
}

// Removes all tooltip elements
function removeToolTips() {
  document.querySelectorAll('.tooltip1').forEach(el => el.remove());
}

// Brings tooltip to front (useful for tooltips layered over elements)
function bringTooltipToFront(node, tooltips) {
  tooltips.forEach(tooltip => {
    tooltip.style.zIndex = "1000";
  });
}

// Creates and returns content for the side tip dialog box
function getSideTipContentEl(text) {
  const dialogContent = document.createElement("div");
  dialogContent.className = "sideTipContent";
  dialogContent.textContent = text;
  return dialogContent;
}

// Clears any text markup by removing specific classes or spans
function clearTextMarkup() {
  document.querySelectorAll('.complex-sentence, .complex-word').forEach((el) => {
    el.classList.remove('complex-sentence', 'complex-word');
  });
}

// Placeholder function for applying markup to complex text
function markupComplexText() {
  console.log("Applying complex text markup...");
}







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
