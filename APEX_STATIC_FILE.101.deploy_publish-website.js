/*
** USER CLICKS PUBLISH BUTTON - PUBLISH EDITOR WEBSITE
*/

import { callAPI, handleError } from "deploy_callAPI";
import { initDialog, dialog_footer } from "deploy_elements";

let endpoint;

export const init = (e) => {
    endpoint = e.dataset.endpoint;
    callAPI(endpoint,"GET")
        .then( (data) => {
            initDialog(data);
        })
        .catch((error) => {
            handleError(error);
        });;
}

let isSending = false;

export const clickHandler = (e) => {
    if (e.target.classList.contains("publish-editor-site")) {
        if (isSending) {
            console.log("Prevent double sends");
            return;
        }
        const live=dialog_footer.querySelector("[aria-live]");
        const loader=dialog_footer.querySelector(".loader");

        isSending = true;
        live.textContent = e.target.dataset.processing;
        loader.style.opacity=1;

        callAPI("publish-website/:ID", "POST", {})
            .then((data) => {
                isSending = false;
                loader.style.opacity=0;        
                live.replaceChildren();
                live.textContent = data.message;
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            })
            .catch((error) => {
                loader.style.opacity=0;
                handleError(error);
            });
    }
}