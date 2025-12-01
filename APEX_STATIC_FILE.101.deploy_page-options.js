/* ************************** */
/* EDIT COLLECTION INDEX      */
/* ************************** */
import { callAPI, handleError } from "deploy_callAPI";
import { output_dialog, dialog_article, dialog_footer, initDialog } from "deploy_elements";

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

const changeHandler = (e) => {
    const name = e.target.getAttribute("name");
    callAPI(endpoint, "PUT", {name:name, value:e.target.value})
    .then((data) => {
        console.log(data);
    })
    .catch((error) => {
            handleError(error);
    });
}

let isSending = false;

const clickHandler = (e) => {
    if (!e.target.matches(".publish")) return;

    if (isSending) {
        console.log("Prevent double sends");
        return;
    }
    const live=dialog_footer.querySelector("[aria-live]");
    const loader = dialog_footer.querySelector(".loader");

    isSending = true;
    live.textContent = e.target.dataset.processing;

    const form = output_dialog.querySelector("form");
    const formData = new FormData(form);
    const formObj = Object.fromEntries(formData);
    loader.style.opacity=1;

    callAPI(endpoint, 'POST', formObj)
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
};

dialog_article.addEventListener("change", changeHandler);
dialog_footer.addEventListener("click", clickHandler);