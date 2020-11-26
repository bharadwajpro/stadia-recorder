chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'downloadUrl') {
        chrome.downloads.download({
            url: message.url,
            filename: `Stadia Recording at ${Date.now()}.webm`
        }, (downloadItem) => {
            var interval = setInterval(() => {
                chrome.downloads.search({id: downloadItem}, (downloadItems) => {
                    if (downloadItems[0]['state'] === "complete" || downloadItems[0]['state'] === "interrupted") {
                        chrome.tabs.query({active: true}, (tabs) => {
                            tabs.forEach(tab => {
                                chrome.tabs.sendMessage(tab['id'], ({
                                    type: 'executeOnPage',
                                    code: `window.URL.revokeObjectURL("${message.url}"); window.srChunks = undefined;`
                                }));
                            });
                        });
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

chrome.commands.onCommand.addListener((command, tab) => {
    if (command === "start_stream") {
        chrome.tabs.sendMessage(tab['id'], ({
            type: 'executeOnPage',
            code: `startStream();`
        }));
    }
    else if (command === "pause_resume_stream") {
        chrome.tabs.sendMessage(tab['id'], ({
            type: 'executeOnPage',
            code: `pauseResumeStream();`
        }));
    }
    else if (command === "stop_stream") {
        chrome.tabs.sendMessage(tab['id'], ({
            type: 'executeOnPage',
            code: `stopStream();`
        }));
    }
});