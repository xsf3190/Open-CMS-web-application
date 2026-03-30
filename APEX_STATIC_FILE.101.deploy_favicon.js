/*
**  WEBSITE FAVICON
*/
import { dialog_article, dialog_footer, initDialog, footerHandler, liveRegion } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

const favicon = document.querySelector("head > link[rel='icon']");

let endpoint;

/*
**  BUTTON HANDLER
*/
const clickHandler = (e) => {
    if (!e.target.id === "update") return;

    const value = document.getElementById("favicon").value;

    callAPI(endpoint,"PUT",{favicon:value})
        .then((data) => {
            if (data.href) {
                favicon.setAttribute("href", data.href); 
            }
            liveRegion(data);
        })
}

/*
**  CHANGE HANDLER - CALL CLICK INSTEAD
*/
const changeHandler = () => {
    document.getElementById("update").trigger("click");
}


export const init = (element) => {
    endpoint = element.dataset.endpoint;

    callAPI(endpoint,"GET")
        .then((data) => {
            initDialog(data);
            dialog_footer.addEventListener("click", footerHandler);
            dialog_article.addEventListener("click", clickHandler);
            dialog_article.addEventListener("change", changeHandler);
        })
        .catch((error) => {
            handleError(error);
        });
}