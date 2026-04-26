/*
** VISIT REPORTS
*/
import { dialog_article, dialog_footer, initDialog } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let endpoint;
let selectedReport=1;

export const init = (element) => {
    endpoint = element.dataset.endpoint;

    callAPI(endpoint, "GET", "?report=" + selectedReport + "&page=1&handler=change")
    .then((data) => {
        initDialog(data);
    })
    .catch((error) => {
            handleError(error);
    });
}

/*
** NEW REPORT REQUEST
*/
export const changeHandler = (e) => {
    selectedReport = document.getElementById("report").value;
    callAPI(endpoint, "GET", "?report=" + selectedReport + "&page=1&handler=change")
    .then((data) => {
        dialog_article.replaceChildren();
        dialog_article.insertAdjacentHTML('afterbegin',data.article);
        dialog_footer.replaceChildren();
        dialog_footer.insertAdjacentHTML('afterbegin',data.footer);
    })
    .catch((error) => {
        handleError(error);
    });
}

/*
** NEW REPORT PAGE REQUEST
*/
export const clickHandler = (e) => {
    const page = e.target.dataset.page;
    if (page) {
        callAPI(endpoint, "GET", "?report=" + selectedReport + "&page=" + page + "&handler=click")
        .then((data) => {
            const tbody = dialog_article.querySelector("tbody");
            tbody.replaceChildren();
            tbody.insertAdjacentHTML('afterbegin',data.article);
            dialog_footer.replaceChildren();
            dialog_footer.insertAdjacentHTML('afterbegin',data.footer);
            const liveRegion = document.getElementById("notification");
            /* Remove any existing child nodes */
            while (liveRegion.firstChild) {
                liveRegion.removeChild(liveRegion.firstChild);
            }
            const message = document.createTextNode(data.notification);
            liveRegion.appendChild(message);
        })
        .catch((error) => {
            // handleError(error);
            console.error(error);
        });
    }
}

export const inputHandler = (e) => {
    console.log("Do nothing");
}