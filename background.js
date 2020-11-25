chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'downloadUrl') {
        chrome.downloads.download({
            url: message.url,
            filename: `Stadia Recording at ${Date.now()}.webm`
        }, (downloadItem) => {
            var interval = setInterval(() => {
                chrome.downloads.search({id: downloadItem}, (downloadItems) => {
                    if (downloadItems[0]['state'] === "complete" || downloadItems[0]['state'] === "interrupted") {
                        sendResponse({
                            type: 'executeOnPage',
                            code: `window.URL.revokeObjectURL("${message.url}");`
                        })
                        clearInterval(interval);
                    }
                })
            }, 5000)
        });
    }
    else if (message.type === "notification") {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'ico128.png',
            title: 'Stadia Recorder',
            message: message.message,
            silent: true
        });
    }
});
