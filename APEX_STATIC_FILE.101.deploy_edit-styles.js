/*
**  MANAGE STYLES
*/
import { dialog_article, dialog_footer, initDialog, liveRegion } from "deploy_elements";
import { callAPI } from "deploy_callAPI";

let endpoint;

export const init = (e) => {
    endpoint = e.dataset.endpoint;

    callAPI(endpoint,'GET')
        .then((data) => {
            initDialog(data);
        })
}

/*
** INPUT HANDLER
*/
export const inputHandler = (e) => {
    console.log("DO NOTHING");
}

/*
**  CHANGE HANDLER
*/
export const changeHandler = (e) => {
    console.log("DO NOTHING");
}

/*
** BUTTON CLICK EVENT HANDLER
*/
export const clickHandler = async (e) => {
    console.log("DO NOTHING");
}