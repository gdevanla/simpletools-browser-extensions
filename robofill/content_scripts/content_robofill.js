"use strict";



function onError(error) {
    console.error(`Error: ${error}`);
}


// var script = document.createElement('script');
// script.src = 'https://code.jquery.com/jquery-3.6.3.min.js'; // Check https://jquery.com/ for the current version
// document.getElementsByTagName('head')[0].appendChild(script);


(() => {
    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    // /**
    //  * Given a URL to a beast image, remove all existing beasts, then
    //  * create and style an IMG node pointing to
    //  * that image, then insert the node into the document.
    //  */
    // function insertBeast(beastURL) {
    //     // removeExistingBeasts();
    //     // const beastImage = document.createElement("img");
    //     // beastImage.setAttribute("src", beastURL);
    //     // beastImage.style.height = "100vh";
    //     // beastImage.className = "beastify-image";
    //     // document.body.appendChild(beastImage);
    //     fillValues(beastURL);
    // }

    function fillValues(profile_name) {

        let frame_index = iframeIndex(window);
        console.log('frame_index=' + frame_index);

        let frame_str = '';
        if (frame_index !== -1) {
            frame_str = '_' + frame_index;
        }

        profile_name = profile_name + frame_str;

        var items = document.getElementsByTagName("*");
        chrome.storage.local.get(profile_name).then((result) => {
            console.log("promise full-filled");
            let data = result[profile_name];
            console.log('Retrieved data for profile=' + profile_name);
            for (const key in data) {
                let elements = document.getElementsByName(key);
                if (typeof elements == "undefined") {
                    continue;
                }
                console.log("elements");
                console.log(elements);
                elements.forEach(function(element) {
                    console.log(element);
                    if (element.type === 'checkbox') {
                        element.checked = data[key];
                    } else if (element.type === 'radio') {
                        if (element.value === data[key]) {
                            element.checked = true;
                        }
                    } else {
                        element.value = data[key];
                    }
                });
            }
        });
    }

    //https://stackoverflow.com/questions/26010355/is-there-a-way-to-uniquely-identify-an-iframe-that-the-content-script-runs-in-fo
    function iframeIndex(win) {
        win = win || window; // Assume self by default
        if (win.parent != win) {
            for (var i = 0; i < win.parent.frames.length; i++) {
                if (win.parent.frames[i] == win) {
                    return i;
                }
            }
            throw Error("In a frame, but could not find myself");
        } else {
            return -1;
        }
    }

    //leave this here, if we want to support nested frames. Currently, not used by this script
    // Returns a unique index in iframe hierarchy, or empty string if topmost
    function iframeFullIndex(win) {
        win = win || window; // Assume self by default
        if (iframeIndex(win) < 0) {
            return "";
        } else {
            return iframeFullIndex(win.parent) + "." + iframeIndex(win);
        }
    }

    function saveValues(profile_name) {

        let frame_index = iframeIndex(window);
        console.log('frame_index=' + frame_index);

        let frame_str = '';
        if (frame_index !== -1) {
            frame_str = '_' + frame_index;
        }

        console.log('Saving values');
        var items = document.querySelectorAll("input, select, textarea, iframe input, iframe select, iframe textarea");
        let contentToStore = {};
        for (var i = 0; i < items.length; i++) {
            if (items[i].type === 'file' || items[i].type === 'hidden') {
                continue;
            }
            let value = items[i].value;
            if (items[i].type === 'checkbox') {
                value = items[i].checked;
            }
            if (items[i].type === 'radio') {
                if (items[i].checked) {
                    value = items[i].value; // need to save radio button
                } else {
                    continue;
                } // radio buttons share same name
            }

            contentToStore[items[i].name] = value;
        }
        let rootContent = {
            [profile_name + frame_str]: contentToStore
        };
        console.log(rootContent);
        console.log("before save");
        chrome.storage.local.set(rootContent);

        console.log('Frame_index=', frame_index);
        console.log('Frames length=', window.parent.frames.length);
        let parent_length = window.parent.frames.length;
        if ((frame_index === -1 && parent_length === 0) || (frame_index === window.parent.frames.length - 1)) {
            console.log('sending message to background script');
            chrome.runtime.sendMessage({
                action: "show_notification",
                message: "The form values have been changed!"
            });
        }
    }


    // function sendMessageToTabs(tabs) {
    //     for (const tab of tabs) {
    //         browser.tabs
    //             .sendMessage(tab.id, { greeting: "Hi from background script" })
    //             .then((response) => {
    //                 console.log("Message from the content script:");
    //                 console.log(response.response);
    //             })
    //             .catch(onError);
    //     }
    // }

    /**
     * Remove every beast from the page.
     */
    function removeExistingBeasts() {
        const existingBeasts = document.querySelectorAll(".beastify-image");
        for (const beast of existingBeasts) {
            beast.remove();
        }
    }

    /**
     * Listen for messages from the background script.
     * Call "insertBeast()" or "removeExistingBeasts()".
     */
    chrome.runtime.onMessage.addListener((message) => {
        console.log("listener");
        console.log(message.command);
        if (message.command === "reset") {
            removeExistingBeasts();
        } else if (message.command === "update") {
            console.log('Calling save/update');
            saveValues(message.profile_name);
        } else if (message.command === "fill") {
            console.log("calling fillValues");
            fillValues(message.profile_name);
        } else if (message.command === "save_as") {
            console.log('Calling save_as');
            saveValues(message.profile_name);
        }
    });
})();