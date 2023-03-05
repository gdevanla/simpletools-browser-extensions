// listen for messages from the content script
chrome.runtime.onInstalled.addListener(() => {
    console.log('onInstalled called. Setting up default values in storage');
    chrome.storage.local.set({
        active_profile: 'default'
    });
    chrome.storage.local.set({
        default: {}
    });
});

chrome.runtime.onMessage.addListener((message, sender) => {
    console.log('inside background script');
    // check if the message action is to show a notification
    if (message.action === "show_notification") {
        console.log('sending message to tab');
        // get the current tab
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }).then((tabs) => {
            // send a message to the current tab to show the notification
            console.log('right before sending message');
            console.log(tabs[0].id);
            console.log(message.message);

            // this is a hack which may not work always
            var alertWindow = ((msg) => alert(msg));
            console.log(alertWindow);
            chrome.scripting.executeScript({
                target: {
                    tabId: tabs[0].id
                },
                args: [message.message],
                func: alertWindow
            });

            // browser.notifications.create({
            //     type : 'basic',
            //     message : message.message,
            //     title : 'Extension alert'
            // });
        });
    } else if (message.action === "get_confirmation") {
        console.log('inside get confirmation');
    }

});