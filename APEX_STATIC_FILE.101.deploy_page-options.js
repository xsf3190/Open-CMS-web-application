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
        dml = dialog_article.querySelector("[name=dml]")?.value;
    })
    .catch((error) => {
            handleError(error);
    });
}

const changeHandler = (e) => {
    if (dml==="insert") return;

    const name = e.target.getAttribute("name");

    if (name==="logo") {
        const logo = document.querySelector(".logo");
        logo.replaceChildren();
	    logo.insertAdjacentHTML("beforeend",e.target.value);
        const svg = logo.querySelector("svg");
        if (!svg) {
            handleError("NOT VALID SVG");
            return;
        }

        const viewBox = svg.getAttribute("viewBox")?.split(" ");
        if (!viewBox) {
            handleError("SVG MUST HAVE VIEWBOX");
            return;
        }
        
        const width = Number(viewBox[0]) + Number(viewBox[2]);
        const height = Number(viewBox[1]) + Number(viewBox[3]);

        logo.style.aspectRatio = width + "/" + height;
    }
    
    callAPI(endpoint, "PUT", {name:name, value:e.target.value})
    .then((data) => {
        console.log(data);
    })
    .catch((error) => {
            handleError(error);
    });
}

let isSending = false;

/*
**  CLICK PUBLISH OR DELETE BUTTON
*/
const clickHandler = (e) => {
    if (!e.target.classList.contains("publish") && !e.target.classList.contains("delete")) {
        return;
    }

    if (isSending) {
        console.log("Prevent double sends");
        return;
    }
    const live=dialog_footer.querySelector("[aria-live]");
    const loader = dialog_footer.querySelector(".loader");

    isSending = true;
    live.textContent = e.target.dataset.processing;
    loader.style.opacity=1;

    const formObj = {};
    let method;

    if (e.target.classList.contains("publish")) {
        formObj["dml"]=dml;
        formObj["title"]=dialog_article.querySelector("[name=title]")?.value;
        formObj["excerpt"]=dialog_article.querySelector("[name=excerpt]")?.value;
        method = "POST";
    } else {
        method="DELETE";
        e.target.remove();
    }

    callAPI(endpoint, method, formObj)
        .then((data) => {
            isSending = false;
            loader.style.opacity=0;        
            live.replaceChildren();
            if (data.link) {
                live.insertAdjacentHTML('beforeend',data.link);
                live.style.color = "green";
            }
            if (data.message) {
                live.insertAdjacentHTML('beforeend',data.message);
                live.style.color = "red";
            }
        })
        .catch((error) => {
            loader.style.opacity=0;
            handleError(error);
        });
};

dialog_article.addEventListener("change", changeHandler);
dialog_footer.addEventListener("click", clickHandler);