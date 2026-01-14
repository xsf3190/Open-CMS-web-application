/*
** VISIT REPORTS
*/
import { dialog_header, dialog_article, dialog_footer, initDialog } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let endpoint;
let selectedReport=1;

export const init = (element) => {
    endpoint = element.dataset.endpoint;

    callAPI(endpoint, "GET", "?report=" + selectedReport + "&page=1&handler=change")
    .then((data) => {
        initDialog(data);
        dialog_header.addEventListener("change", changeHandler);
        dialog_footer.addEventListener("click", clickHandler);
    })
    .catch((error) => {
            handleError(error);
    });
}

/*
** NEW REPORT REQUEST
*/
const changeHandler = (e) => {
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
const clickHandler = (e) => {
    console.log(" e.target.dataset.page", e.target.dataset.page);
    callAPI(endpoint, "GET", "?report=" + selectedReport + "&page=" + e.target.dataset.page + "&handler=click")
    .then((data) => {
        const tbody = dialog_article.querySelector("tbody");
        tbody.replaceChildren();
        tbody.insertAdjacentHTML('afterbegin',data.article);
        dialog_footer.replaceChildren();
        dialog_footer.insertAdjacentHTML('afterbegin',data.footer);
    })
    .catch((error) => {
        // handleError(error);
        console.error(error);
    });
}