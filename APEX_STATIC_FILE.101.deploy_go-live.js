/*
** USER CLICKS GO LIVE BUTTON
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

export const clickHandler = async (e) => {
    if (e.target.matches(".go-live")) {
        if (isSending) {
            console.log("Prevent double sends");
            return;
        }
        const live=dialog_footer.querySelector("[aria-live]");
        const loader = dialog_footer.querySelector(".loader");
        
        isSending = true;
        live.textContent = e.target.dataset.processing;
        loader.style.opacity=1;

        await callAPI(endpoint,'POST',{})
            .then((data) => {
                isSending = false;
                loader.style.opacity=0;        
                live.replaceChildren();
                live.textContent = data.message;
                if (data.live_url) {
                    setTimeout(() => {
                        window.location.replace(data.live_url);
                    }, 1500);
                }
            })
            .catch((error) => {
                loader.style.opacity=0;
                handleError(error);
            });
    }
}

export const inputHandler = async (e) => {
    console.log("DO NOTHING");
}

export const changeHandler = async (e) => {
    console.log("DO NOTHING");
}