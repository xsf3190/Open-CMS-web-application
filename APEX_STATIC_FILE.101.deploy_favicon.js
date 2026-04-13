/*
**  WEBSITE FAVICON
*/
import { initDialog, liveRegion } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

const favicon = document.querySelector("head > link[rel='icon']");

let endpoint;

/*
**  BUTTON HANDLER
*/
export const clickHandler = (e) => {
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
export const changeHandler = () => {
    document.getElementById("update").trigger("click");
}


export const init = (element) => {
    endpoint = element.dataset.endpoint;

    callAPI(endpoint,"GET")
        .then((data) => {
            initDialog(data);
        })
        .catch((error) => {
            handleError(error);
        });
}