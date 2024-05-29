debounce = (func, delay) => {     //to debounce the script action to wait for the DOM to load
    let debounceTimer;
    return function(...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  };

retrieveText = () => {      //retrieve the text content of the post from where the button was clicked
    try {
      const button = document.querySelector('button[id="same-response-button"]');
      if (!button) throw new Error("Button not found");

      let parentNode = button;
      for (let i = 0; i < 6; i++) {
        parentNode = parentNode.parentNode;
        if (!parentNode) throw new Error("Parent node not found");
      }
      const postContent = parentNode.querySelector('div[data-testid="tweetText"]').textContent;
      return postContent || "Text not found!";
    } catch (err) {
      console.log('Error retrieving text:', err);
      return "There wasn't any text! Probably some emoji but this parser can only do text for now.";
    }
  };
handleTextInjection = () => {       //handles the injection of the Text
    const textParent = document.querySelector('div[aria-label="Post text"]');
    if (textParent) {
        const textbox = textParent.getElementsByTagName('span')[0];
      if (textbox) {
        textbox.textContent = retrieveText();
        const wordLimitcheck = document.querySelectorAll('div[aria-live="polite"]')
        if(wordLimitcheck.length > 1){
          textbox.textContent = textbox.textContent.substring(0, 280)
          textbox.click();
          textbox.dispatchEvent(new Event("input", { bubbles: true }));
          return;
        }
        textbox.click();
        textbox.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  };

injectButton = () => {          //the button that is injected to the DOM
    const progressbar = document.querySelector('div[role="progressbar"]');
    if (progressbar) {
      const uniqueNode = progressbar.parentNode.lastChild.lastChild;
      if (!document.querySelector('button[id="same-response-button"]')) {
        uniqueNode.innerHTML = `
          <div style="width:100%; display:flex; justify-content:end">
            <button id="same-response-button" style="margin-right: 16px; border-radius: 9999px; background-color: #1D9BF0; color: white; padding: 0.5em; font-weight: bold; z-index: 9999;">Copy Paste</button>
          </div>`;
        const button = document.querySelector('button[id="same-response-button"]');
        if (button) {
          button.addEventListener('click', handleTextInjection);
        }
      }
    }
  };

handleModalTextInjection = () => {      //Handle the text injection in the Modal view of the post
    const modalNode = document.querySelector('div[aria-labelledby="modal-header"]')
    if(modalNode){
        const tweetContent = modalNode.querySelector('div[data-testid="tweetText"]').textContent
        const targetBox = modalNode.querySelector('div[data-testid="tweetTextarea_0"]').firstChild.firstChild.firstChild.firstChild
            if(targetBox){
                if(tweetContent !== '') {
                  if(tweetContent.length > 280) 
                    {
                      targetBox.textContent = tweetContent.substring(0, 280)
                    }
                  else{
                      targetBox.textContent = tweetContent
                    }
                }
                else targetBox.textContent = `Sorry no text to copy, here is a joke you could share in twitter: How do trees get on the Internet? They log in.`
                targetBox.click();
                targetBox.dispatchEvent(new Event("input", { bubbles: true }));
            }
    }
}

injectModalButton = () => {         //Handle the button injection to the Modal DOM
    const modalNode = document.querySelector('div[aria-labelledby="modal-header"]')
    if(modalNode){
        const parentNode = modalNode.querySelector('div[data-testid="ScrollSnap-List"]')
        if(parentNode){
            if(!parentNode.querySelector('button[id="same-response-button"]')){
                const button = document.createElement('div')
                button.innerHTML = `<button id="same-response-button" style="margin-right: 16px; border-radius: 9999px; background-color: #1D9BF0; color: white; padding: 0.5em; font-weight: bold; z-index: 9999;">Copy Paste</button>`
                parentNode.appendChild(button)
                const modalButton = parentNode.querySelector('button[id="same-response-button"]')
                modalButton.addEventListener('click', handleModalTextInjection)
            }
        }
    }
}
cleanUpButton = () => {            //Remove the button if not needed
    const button = document.querySelector('button[id="same-response-button"]');
    if (button) {
      button.remove();
    }
  };

onReady = () => {              //Script Entry where the url of the DOM is checked to run the respective scripts
    const urlPath = window.location.href.split('/');
    //the conversation page has the div element with aria-label = "Timeline: Conversation" so it checks if the contents of the conversations are loaded
    const conversationTimeline = document.querySelector('div[aria-label="Timeline: Conversation"]');
    if (urlPath[4] === 'status') {
        if(conversationTimeline !== null){
            if(document.querySelector('button[data-testid="tweetButtonInline"]')){
                injectButton();
            }
        }
    }
    else if(window.location.href.includes("x.com/compose/post")){       //the modal view has the url mentioned here
        injectModalButton();
    }
    else {
      cleanUpButton();
    }
  };

observerCallback = debounce(() => onReady(), 200);      //to debounce the script until DOM is loaded

observerOptions = {
    childList: true,
    subtree: true
  };

observer = new MutationObserver(observerCallback);
observer.observe(document.body, observerOptions);       //checks for DOM changes like opening a modal or redirecting to another page

overrideHistoryMethods = () => {               //This checks and stores the url to avoid any wierd side effects while going back and forth in the twitter page
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      window.dispatchEvent(new Event('pushstate'));
    };
    const originalReplaceState = history.replaceState;
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event('replacestate'));
    };
  };

if (document.readyState !== 'loading') {        //DOM loading conditions
    onReady();
  }
else {
    document.addEventListener("DOMContentLoaded", onReady);
  }

handleNavigationEvents = () => {            //eventlistners for navigation changes
    window.addEventListener('popstate', onReady);
    window.addEventListener('pushstate', onReady);
    window.addEventListener('replacestate', onReady);

  };

overrideHistoryMethods();       //the method is called to start running
handleNavigationEvents();
