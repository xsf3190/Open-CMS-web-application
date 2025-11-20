/*
** USER CLICKS DEPLOY BUTTON
*/

import { callAPI, handleError } from "deploy_callAPI";
import { output_dialog, dialog_article, initDialog } from "deploy_elements";

const endpoint = "publish-website/:ID";
let intervalId;

export const init = (e) => {

    callAPI(endpoint,"POST",{env:e.dataset.env})
        .then( (data) => {
            initDialog(data);
            if (data.stop) return;
            if (intervalId) {
                clearInterval(intervalId);
            }
            /*
            ** RELOAD HOME PAGE WHEN CLOSING DIALOG
            */
            output_dialog.addEventListener("close", () => {
                window.location.replace(location.origin);
            })
            intervalId = setInterval(getDeploymentStatus,2000);
        })
        .catch((error) => {
            handleError(error);
        });;
}

/*
** SHOW NETLIFY DEPLOYMENT PROGRESS
*/
const getDeploymentStatus = () => {
    callAPI(endpoint,"GET")
        .then( (data) => {
            if (data.content) {
                const tbody = dialog_article.querySelector("tbody");
                tbody.insertAdjacentHTML('beforeend',data.content);
                tbody.querySelector(":last-child").scrollIntoView();
            }
            if (data.completed) {
                clearInterval(intervalId);
            }
        })
        .catch((error) => {
            handleError(error);
        })
}