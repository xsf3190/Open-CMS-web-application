/* ************************** */
/* EDIT COLLECTION INDEX      */
/* ************************** */
import { callAPI, handleError } from "deploy_callAPI";
import { dialog_article, dialog_footer, initDialog } from "deploy_elements";

let endpoint;
let dml;

export const init = (element) => {
    endpoint = element.dataset.endpoint;
    
    
    callAPI(endpoint, "GET")
    .then((data) => {
        initDialog(data);
        dml = dialog_article.querySelector("[name=dml]").value;
    })
    .catch((error) => {
            handleError(error);
    });
}

const changeHandler = (e) => {
    if (dml==="insert") return;

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
    loader.style.opacity=1;

    const formObj = {dml:dml};
    
    if (dml==="insert") {
        formObj["title"]=document.querySelector("[name=title]").value;
        formObj["excerpt"]=document.querySelector("[name=excerpt]").value;
    }

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