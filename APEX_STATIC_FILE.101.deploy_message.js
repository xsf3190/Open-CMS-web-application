/*
**  LEAVE A MESSAGE (MUST BE AUTHENTICATED)
*/
import { output_dialog, dialog_article, dialog_footer, initDialog, } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let messageInput, messageError, charcounter, maxchars;

let endpoint;

export const init = (element) => {
    endpoint = element.dataset.endpoint;

    callAPI(endpoint, "GET")
    .then((data) => {
        initDialog(data);
        /* SET VARIABLES FOR INTERACTIVE ELEMENTS REFERENCED IN EVENT HANDLERS */
        messageInput = dialog_article.querySelector("[name='message']");
        messageError = dialog_article.querySelector(".messageInput-result");
        charcounter = dialog_article.querySelector(".charcounter");
        maxchars = messageInput.getAttribute("maxlength");
    })
    .catch((error) => {
            handleError(error);
    });
}

const inputHandler = () => {
    
    const charcounter = dialog_article.querySelector(".charcounter");
    const maxchars = messageInput.getAttribute("maxlength");

    let numOfEnteredChars = messageInput.value.length;
    charcounter.textContent = numOfEnteredChars + "/" + maxchars;

    if (numOfEnteredChars === Number(maxchars)) {
        charcounter.style.color = "red";
    } else {
        charcounter.style.color = "initial";
    }
};

dialog_article.addEventListener("input", inputHandler);


const clickHandler = (e) => {
    if (!e.target.matches(".send")) return;
    
    if (messageInput.validity.valueMissing) {
        messageError.textContent = "Enter a message";
        messageError.style.color = "red";
        return;
    }
    
    const form = output_dialog.querySelector("form");

    const formData = new FormData(form);
    const formObj = Object.fromEntries(formData);
    callAPI(endpoint, 'POST', formObj)
        .then(() => {
            const sendresult = dialog_footer.querySelector(".send-result");
            sendresult.textContent = "Successfully Sent";
            sendresult.style.color = "green";
            e.target.disabled = true;
        })
        .catch((error) => {
            handleError(error);
        });
};

dialog_footer.addEventListener("click", clickHandler);