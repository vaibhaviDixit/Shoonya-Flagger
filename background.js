chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "flagText",
      title: "Flag",
      contexts: ["selection"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "flagText") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: showAlertAndConfirm,
        args: [info.selectionText]
      });
    }
  });
  
  function showAlertAndConfirm(flag) {
    const hoverAndFetch = () => {
      return new Promise((resolve) => {
        const event = new MouseEvent('mouseover', {
          view: window,
          bubbles: true,
          cancelable: true
        });
  
        const svgElement = document.querySelectorAll("p.MuiTypography-root.MuiTypography-body1 svg")[0];
        if (svgElement) {
          svgElement.dispatchEvent(event);
  
          setTimeout(() => {
            const elementText = document.querySelectorAll("p.MuiTypography-root.MuiTypography-body1")[3]?.innerText || "Not found";
            const tooltipText = document.querySelector('.MuiTooltip-popper.MuiTooltip-popperInteractive.MuiPopper-root')?.innerText || "Not found";
            resolve({ elementText, tooltipText });
          }, 1000);  // Adjust the timeout as necessary
        } else {
          resolve({ elementText: "SVG element not found", tooltipText: "Tooltip not found" });
        }
      });
    };
  
    hoverAndFetch().then(({ elementText, tooltipText }) => {
      const taskIdMatch = elementText.match(/Task #(\d+)/);
      const taskId = taskIdMatch ? taskIdMatch[1] : "Not found";
  
      const annotatorMatch = tooltipText.match(/Annotator ([^\s]+)/);
      const annotator = annotatorMatch ? annotatorMatch[1] : "Not found";
  
      const reviewerMatch = tooltipText.match(/Reviewer ([^\s]+)/);
      const reviewer = reviewerMatch ? reviewerMatch[1] : "Not found";
  
      const superCheckerMatch = tooltipText.match(/SuperChecker ([^\s]+)/);
      const superChecker = superCheckerMatch ? superCheckerMatch[1] : "Not found";
  
      const message = `Task ID: ${taskId}\nAnnotator: ${annotator}\nReviewer: ${reviewer}\nSuperChecker: ${superChecker}\nFlagged Text: ${flag}`;
      
        const flagData = {
          "taskID": taskId,
          "annotator": annotator,
          "reviewer": reviewer,
          "superchecker": superChecker,
          "flag": flag
        };
        
        const formBody = Object.keys(flagData)
          .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(flagData[key]))
          .join('&');
  
        fetch('https://imradhe.com/api/flag', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formBody
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(data => {
          console.log('Response data:', data);
          alert(message+" Flag successfully submitted.");
        })
        .catch(error => {
          console.error('Error:', error);
          alert("An error occurred while submitting the flag.");
        });
      
    });
  }
  