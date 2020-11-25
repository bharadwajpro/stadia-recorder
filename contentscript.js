downloadUrl = function(url) {
    chrome.runtime.sendMessage({
        type: 'downloadUrl',
        url
    })
}

showNotification = function(message) {
    chrome.runtime.sendMessage({
        type: 'notification',
        message
    })
}

clientUtils = {
    downloadUrl,
    showNotification
}

window.addEventListener('stadiaRecorder', (event) => {
    const {fn, fnArgs} = event.detail;
    console.log(`triggering ${fn} function with args`, fnArgs);
    clientUtils[fn](...fnArgs);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'executeOnPage') {
        executeOnPage(message.code);
    }
});
