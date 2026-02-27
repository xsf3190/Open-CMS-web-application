import { dialog_article, initDialog } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let endpoint;

export const init = (element) => {
    endpoint = element.dataset.endpoint;
    callAPI(endpoint,"GET", "?context=HTML")
        .then((data) => {
            initDialog(data);
            dialog_article.addEventListener("change", changeHandler);
        })
        .catch((error) => {
            handleError(error);
        });
}

/*
** USER SELECTS FONT CATEGORY OR FONT
*/
const changeHandler = (e) => {
    const id = e.target.getAttribute("id");

    console.log("id",id);
};