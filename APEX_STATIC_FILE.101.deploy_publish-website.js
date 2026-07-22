/*
** USER CLICKS PUBLISH BUTTON - PUBLISH EDITOR WEBSITE
*/

import { callAPI } from "deploy_callAPI";
import { initDialog, dialog_footer } from "deploy_elements";

/* 
** WHEN CALLED FROM MAIN APPLICATION MENU
*/
export const init = (e) => {
    callAPI(e.dataset.endpoint,"GET")
        .then( (data) => {
            initDialog(data);
        })
}

/*
**  REMOVE ANY "font" properties from localStorage
*/
const clearStorage = () => {
    console.log("starting clearStorage of any font properties")
    const keys = Object.keys(localStorage);
    let i = keys.length;

    while ( i-- ) {
        if (keys[i].includes("font")) {
            localStorage.removeItem(keys[i]);
        }
    }
}

let isSending = false;

export const clickHandler = (e) => {
    if (e.target.classList.contains("publish-editor-site") ||
        e.target.classList.contains("publish-live-site")) {
        const endpoint = e.target.dataset.endpoint;
        if (isSending) {
            console.log("Prevent double sends");
            return;
        }
        const live=dialog_footer.querySelector("[aria-live]");
        const loader=dialog_footer.querySelector(".loader");

        isSending = true;
        live.textContent = e.target.dataset.processing;
        loader.style.opacity=1;

        callAPI(endpoint, "POST", {})
            .then((data) => {
                isSending = false;
                loader.style.opacity=0;        
                live.replaceChildren();
                live.textContent = data.message;
                clearStorage();
                setTimeout(() => {
                    if (endpoint.includes("go-live")) {
                        window.location.href = data.live_url;
                    } else {
                        window.location.reload();
                    }
                }, 1500);
            })
    }
}