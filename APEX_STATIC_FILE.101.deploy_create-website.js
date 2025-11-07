/* **************************************************************************** */
/* CREATE NEW WEBSITE. DOMAIN NAME OPTIONAL, DEFAULTS TO RANDOMLY GENERATED NAME                             */
/* **************************************************************************** */
import { callAPI, handleError } from "deploy_callAPI";
import { output_dialog, dialog_footer, initDialog } from "deploy_elements";

let endpoint;

export const init = (element) => {
    endpoint = element.dataset.endpoint;
    
    callAPI(endpoint, "GET")
    .then((data) => {
        initDialog(data);
    })
    .catch((error) => {
            handleError(error);
    });
}

let isSending = false;

const clickHandler = (e) => {
    if (!e.target.matches(".send")) return;

    if (isSending) {
        console.log("Prevent double sends");
        return;
    }
    const sendresult = dialog_footer.querySelector(".send-result");
    const loader = dialog_footer.querySelector(".loader");

    isSending = true;
    sendresult.textContent = e.target.getAttribute("data-loading-msg");

    const form = output_dialog.querySelector("form");
    
    const formData = new FormData(form);
    const formObj = Object.fromEntries(formData);
    loader.style.opacity=1;

    callAPI(endpoint, 'POST', formObj)
        .then((data) => {
            isSending = false;
            loader.style.opacity=0;        
            sendresult.replaceChildren();
            sendresult.insertAdjacentHTML('beforeend',data.link);
            sendresult.style.color = "green";
        })
        .catch((error) => {
            loader.style.opacity=0;
            handleError(error);
        });
};

dialog_footer.addEventListener("click", clickHandler);