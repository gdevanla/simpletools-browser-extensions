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

    // function fillValues_old(profile_name) {

    //     let frame_index = iframeIndex(window);
    //     console.log('frame_index=' + frame_index);

    //     let frame_str = '';
    //     if (frame_index !== -1) {
    //         frame_str = '_' + frame_index;
    //     }

    //     profile_name = profile_name + frame_str;

    //     //var items = document.getElementsByTagName("*");

    //     chrome.storage.local.get(profile_name).then((result) => {
    //         console.log("promise full-filled");
    //         console.log('Retrieved data for profile=' + profile_name);
    //         let data = result[profile_name];
    //         let all_labels = document.getElementsByTagName('label');
    //         for (const key in data) {
    //             let value_in_store = data[key];

    //             // now discover element and attach value
    //             // this is slow, need to move this out
    //             let input_elements = [];
    //             for (let i = 0; i < all_labels.length; i++) {
    //                 let label_element = all_labels[i];
    //                 if (label_element.htmlFor === key) {
    //                     input_elements = [document.getElementById(label_element.htmlFor)];
    //                     break;
    //                 }
    //                 else if (label_element.textContent.trim() === key) //label without htmlFor value
    //                 {
    //                     input_elements = [label_element.children[0]]; // only worry about one element now
    //                     break;
    //                 }
    //             }
    //             // we looked at all labels and if we still did not find the element, then we are storing a name
    //             if (input_elements.length === 0) {
    //                 input_elements = document.getElementsByName(key);
    //             }

    //             input_elements.forEach(function(element) {
    //                 console.log(element);
    //                 console.log(value_in_store);
    //                 if (!element){
    //                     return;
    //                 }
    //                 // this is cautionary
    //                 if (element.type === 'file' || element.type === 'hidden') {
    //                     return;
    //                 }

    //                 if (element.type === 'checkbox') {
    //                     element.checked = value_in_store;
    //                 } else if (element.type === 'radio') {
    //                     if (element.value === value_in_store) {
    //                         element.checked = true;
    //                     }
    //                 } else {
    //                     element.value = value_in_store;
    //                 }
    //             });
    //         }
    //     });
    // }

    function fillValues(profile_name) {
        let frame_index = iframeIndex(window);
        console.log('frame_index=' + frame_index);
        let frame_str = '';
        if (frame_index !== -1) {frame_str = '_' + frame_index;}
        profile_name = profile_name + frame_str;

        //var items = document.getElementsByTagName("*");
        chrome.storage.local.get(profile_name).then((result) => {
            console.log("promise full-filled");
            console.log('Retrieved data for profile=' + profile_name);
            let data = result[profile_name];

            var items = document.querySelectorAll("input, select, textarea, iframe input, iframe select, iframe textarea");
            let contentToStore = {};
            for (var i = 0; i < items.length; i++) {
                if (items[i].type === 'file' || items[i].type === 'hidden') {
                    continue;
                }

                let labels = items[i].labels;
                let key = "";
                if (labels !== "undefined" && labels.length > 0) {
                    if (labels[0].htmlFor === "undefined" || labels[0].htmlFor === "") {
                        key = labels[0].textContent.trim();
                    }
                    else
                    {
                        key = labels[0].htmlFor;
                    }

                }
                // last resort
                if (key === "") {
                    key = items[i].name;
                }

                if (! key in data) {
                    continue; // new field which we don't know about
                }

                let value_in_store = data[key];
                if (value_in_store === "undefined") {
                    continue;
                }

                if (items[i].type === 'checkbox') {
                    items[i].checked = value_in_store;
                } else if (items[i].type === 'radio') {
                    if (items[i].value === value_in_store) {
                        items[i].checked = true;
                    }
                } else {
                    items[i].value = value_in_store;
                    if (items[i].tagName == 'SELECT') {
                        for (let j=0;j < items[i].childElementCount;j++) {
                            if (items[i].children[j].value == value_in_store) {
                                items[i].children[j].selected = true;
                                simulateClick(items[i].children[j]);
                            }
                        }

                    }
                }
            }
        });
    }

    function simulateClick(item) {
        // https://stackoverflow.com/questions/49886729/simulate-a-human-click-and-select-on-dropdown-menu
        item.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
        item.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
        item.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}));
        item.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
        item.dispatchEvent(new MouseEvent('mouseout', {bubbles: true}));
        item.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        item.dispatchEvent(new Event('change', {bubbles: true}));

        return true;
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

            let labels = items[i].labels;
            let key = "";
            if (labels !== "undefined" && labels.length > 0) {
                if (labels[0].htmlFor === "undefined" || labels[0].htmlFor === "") {
                    key = labels[0].textContent.trim();
                }
                else
                {
                    key = labels[0].htmlFor;
                }
            }
            // last resort
            if (key === "") {
                // check parent
                if (items[i].parentElement.tagName === 'LABEL') {
                    key = items[i].parentElement.textContent.trim();
                }
                //key = items[i].name;
            }

            if (key !== "") {
                // only save if we succeeded finding a label. Saving anything else for generic fields is useless across pages
                contentToStore[key] = value;
            }
        }
        let rootContent = {
            [profile_name + frame_str]: contentToStore
        };
        console.log(rootContent);
        console.log("before save");


        chrome.storage.local.get(profile_name + frame_str).then((result) => {
            let local_data = result[profile_name + frame_str];
            console.log('state of local_data ==', local_data);
            if (!local_data) {
                console.log('just copying over stuff we built');
                local_data = rootContent;
            }
            else
            {
                for (var key in rootContent[profile_name + frame_str]) {
                    // transfer over the values and overwrite existing keys
                    console.log('transferring over values for key=' + key);
                    local_data[key] = rootContent[profile_name+frame_str][key];
                    console.log('set up local_data for');
                    console.log(local_data[key]);

                }
                console.log(local_data);
                local_data = {[profile_name + frame_str]: local_data};
                console.log('before leaving else=');
                console.log(local_data);
            }
            console.log('final local data = ');
            console.log(local_data[profile_name + frame_str]);
            chrome.storage.local.set(local_data);
        });

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
