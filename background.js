
const handleScripting=(finalTab)=>{
    chrome.scripting.executeScript({
        target: { tabId: finalTab.id },
        files: ['scripts/content.js']
    })
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    const data = changeInfo
    if(data.status === 'complete'){
        chrome.tabs.get(tabId, finalTab => {
                if(finalTab.url.includes('https://twitter.com/') || finalTab.url.includes('https://x.com/')){
                    handleScripting(finalTab)
                }
          });
    }
});

chrome.tabs.onActivated.addListener(activeInfo=> {
    chrome.tabs.get(activeInfo.tabId,tab=> {
        if(tab.url.includes('https://twitter.com') || tab.url.includes('https://x.com')){
            handleScripting(tab)
        }
    })
  });


