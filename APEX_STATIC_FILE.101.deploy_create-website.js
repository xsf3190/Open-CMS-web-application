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
    isSending = true;

    const form = output_dialog.querySelector("form");

    const formData = new FormData(form);
    const formObj = Object.fromEntries(formData);
    callAPI(endpoint, 'POST', formObj)
        .then((data) => {
            isSending = false;
            const sendresult = dialog_footer.querySelector(".send-result");
            if (data.message) {
                sendresult.textContent = data.message;
                sendresult.style.color = "red";
            } else if (data.link) {
                sendresult.replaceChildren();
                sendresult.insertAdjacentHTML('beforeend',data.link);
                sendresult.style.color = "green";
            } else {
                console.error("ERROR. MUST RETURN EITHER MESSAGE OR LINK");
            }
        })
        .catch((error) => {
            handleError(error);
        });
};

dialog_footer.addEventListener("click", clickHandler);