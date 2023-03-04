function selectProfile() {
    console.log("inside select active profile");
    chrome.storage.local.get('active_profile').then((result) => {
        console.log("retrieved " + result['active_profile']);
        let element = document.getElementById('selected_profile');
        for (i=0; i < element.length; i++){
            console.log(element[i].value + "," + result['active_profile']);
            if (result['active_profile'] === element[i].innerHTML) {
                console.log('Setting active profile to ' + element[i].value);
                element.selectedIndex = i;
                break;
            }
        }
    });
}

function populateProfiles() {
    chrome.storage.local.get().then((result)=>{
        keys = Object.keys(result);
        console.log('keys=' + keys);
        let element = document.getElementById('selected_profile');
        let i = 0;
        keys.forEach((key) => {
            if (key !== 'active_profile') {
                console.log('key=' + key);
                opt = document.createElement("option");
                opt.value = i;
                opt.innerHTML = key;
                element.append(opt);
                i += 1;
            }
        });
        selectProfile();
    });
}

function setUpProfileChangeEvent() {
    let element = document.getElementById('selected_profile');
    element.onchange = (function () {
        console.log('Updating active profile');
        var index = this.selectedIndex;
        var inputText = this.children[index].innerHTML;
        console.log('Active profile now is' + inputText);
        chrome.storage.local.set({active_profile: inputText});
    });
}

function restoreOptions() {
    populateProfiles();
    setUpProfileChangeEvent();
}

window.addEventListener("load", restoreOptions);

var global_active_profile = '';

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {
    /**
     * Insert the page-hiding CSS into the active tab,
     * then get the beast URL and
     * send a "beastify" message to the content script in the active tab.
     */
      function beastify(tabs) {

          if (e.target.name == 'fill'){
              if (!window.confirm('All values in this form will be over-written with matching saved values. Are you sure you want to proceed?')){
                  return;
              }
          }

          let element = document.getElementsByName('selected_profile')[0];
          let active_profile_name = element[element.selectedIndex].innerHTML;
          console.log('active_profile.innerHTML=' + active_profile_name);
          if (e.target.name === 'save_as') {
              console.log('inside save_as');
              active_profile_name = document.getElementsByName("new_profile_name")[0].value;
              console.log('Active profile that will be saved = ' + active_profile_name);
          }
          console.log(e.target);
          chrome.tabs.sendMessage(tabs[0].id, {
              command: e.target.name,
              profile_name: active_profile_name
          });
      }

    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Could not beastify: ${error}`);
    }

    /**
     * Get the active tab,
     * then call "beastify()" or "reset()" as appropriate.
     */
      console.log(e.target);
      console.log(e.target.type);
    if (e.target.type === "reset") {
      chrome.tabs
        .query({ active: true, currentWindow: true })
        .then(reset)
        .catch(reportError);
    }
      else if (e.target.name === 'fill' || e.target.name === 'save_as' || e.target.name === 'update'){
          chrome.tabs
              .query({ active: true, currentWindow: true })
              .then(beastify)
              .catch(reportError);
      }
      else {
          console.log('just profile was changed');
    }
  });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute beastify content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
//chrome.tabs.onCreated.add(listenForClicks);
    //.then(listenForClicks)
//.catch(reportExecuteScriptError);

listenForClicks();
