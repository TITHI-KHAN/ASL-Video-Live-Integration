// content.js - modifies and adds behaviors to active tab page

(function main() {
  // Existing code...
  
  // Add an arrow pointing from ASL video to highlighted word
  function addArrow(node, targetElement) {
    const arrowDiv = document.createElement("div");
    arrowDiv.classList.add("arrow");
    
    // Position the arrow between node and targetElement
    const nodeRect = node.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    arrowDiv.style.position = "absolute";
    arrowDiv.style.left = (nodeRect.left + targetRect.left) / 2 + "px";
    arrowDiv.style.top = (nodeRect.top + targetRect.top) / 2 + "px";

    document.body.appendChild(arrowDiv);
  }

  // Modifying showToolTip to include an arrow and live feedback
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

    // Fetch live video data
    fetchLiveASLVideo(node.innerText, tooltipWrap);
  }

  // Modifying showSideTip to include an arrow and live feedback
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

      // Fetch live video data
      fetchLiveASLVideo(node.innerText, dialogContent);
    } else {
      alert("Error: A simplification wasn't found for this.");
    }
  }

  // Helper function to fetch live ASL video
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

  // Existing code...
})();
