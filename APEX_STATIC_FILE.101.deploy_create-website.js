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

const clickHandler = (e) => {
    if (!e.target.matches(".send")) return;

    const form = output_dialog.querySelector("form");

    const formData = new FormData(form);
    const formObj = Object.fromEntries(formData);
    callAPI(endpoint, 'POST', formObj)
        .then((data) => {
            const sendresult = dialog_footer.querySelector(".send-result");
            sendresult.textContent = data.message;
            sendresult.style.color = "green";
            e.target.disabled = true;
        })
        .catch((error) => {
            handleError(error);
        });
};

dialog_footer.addEventListener("click", clickHandler);