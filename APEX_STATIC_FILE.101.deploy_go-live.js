/*
** USER CLICKS GO LIVE BUTTON
*/

import { callAPI, handleError } from "deploy_callAPI";
import { initDialog } from "deploy_elements";

let endpoint;

export const init = (e) => {
    endpoint = e.dataset.endpoint;
    callAPI(endpoint,"GET")
        .then( (data) => {
            initDialog(data);
        })
        .catch((error) => {
            handleError(error);
        });;
}