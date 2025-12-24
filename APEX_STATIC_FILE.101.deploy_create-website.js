/* **************************************************************************** */
/* CREATE NEW WEBSITE. DOMAIN NAME OPTIONAL, DEFAULTS TO RANDOMLY GENERATED NAME                             */
/* **************************************************************************** */
import { callAPI, handleError } from "deploy_callAPI";
import { dialog_footer, initDialog } from "deploy_elements";

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
    const live=dialog_footer.querySelector("[aria-live]");
    const loader = dialog_footer.querySelector(".loader");

    isSending = true;
    live.textContent = e.target.dataset.processing;

    // const form = output_dialog.querySelector("form");
    // const formData = new FormData(form);
    // const formObj = Object.fromEntries(formData);
    const formdata = {};
    formdata["domain_name"] = document.getElementById("domain_name").value;
    formdata["contact_email"] = document.getElementById("contact_email").value;
    const pages = [];
    document.querySelectorAll("input:checked").forEach((item) => {
        pages.push(item.value);
    })
    formdata["pages"] = pages;

    loader.style.opacity=1;

    callAPI(endpoint, 'POST', formdata)
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

dialog_footer.addEventListener("click", clickHandler);