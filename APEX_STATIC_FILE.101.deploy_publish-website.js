/*
** USER CLICKS PUBLISH BUTTON
*/

import { callAPI, handleError } from "deploy_callAPI";
import { dialog_footer, initDialog } from "deploy_elements";

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

const clickHandler = (e) => {
    if (!e.target.classList.contains("publish")) {
        return;
    }
    if (isSending) {
        console.log("Prevent double clicks");
        return;
    }
    const live=dialog_footer.querySelector("[aria-live]");
    const loader = dialog_footer.querySelector(".loader");
    const env = e.target.dataset.env;

    isSending = true;

    live.textContent = "Publishing site";
    loader.style.opacity=1;

    callAPI(endpoint, "POST", {env:env})
        .then((data) => {
            isSending = false;
            loader.style.opacity=0;        
            live.replaceChildren();
            live.insertAdjacentHTML('beforeend',data.link);
            live.style.color = "green";
        })
        .catch((error) => {
            loader.style.opacity=0;
            handleError(error);
        });
}

dialog_footer.addEventListener("click", clickHandler);