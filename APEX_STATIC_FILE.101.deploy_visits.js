/*
** VISIT REPORTS
*/

import { dropdown_details } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

//const content = output_dialog.querySelector("article");
const output_dialog = document.querySelector("dialog.output");
const reportlist = output_dialog.querySelector("header > ul");
const showmore = output_dialog.querySelector(".show-more");
const article = output_dialog.querySelector("article");
const status = output_dialog.querySelector("footer>*:first-child");

let endpoint;

export const init = (element) => {
    endpoint = element.dataset.endpoint;

    dropdown_details.removeAttribute("open");

    callAPI(endpoint, "POST", {})
        .then(() => {
            const reports = element.dataset.reports.split(";");
            let buttons="";
            for (let i = 0; i < reports.length; i++) {
                const elements = reports[i].split("|");
                buttons += `<li><button class="button" type="button" data-report="${elements[0]}" data-button-variant="small">${elements[1]}</button></li>`;
            }
            reportlist.replaceChildren();
            reportlist.insertAdjacentHTML('afterbegin',buttons);
            output_dialog.showModal();
            reportlist.querySelector("button:first-of-type").click();
        })
        .catch((error) => {
            handleError(error);
        });
}

const listenCwv = () => {
    article.querySelectorAll(".cwv").forEach( (button) => {
        button.addEventListener("click", (e) => {
            e.target.closest("tr").querySelector("button:first-of-type").click();
        });
    });
}

const getReport = async (report, offset) => {
    const query = "?report=" + report + "&offset=" + offset;
    
    callAPI(endpoint, "GET", query)
    .then((data) => {
        if (data.article.startsWith("<svg")) {
            article.replaceChildren();
            article.insertAdjacentHTML('afterbegin',data.article);
            showmore.classList.add("visually-hidden");
            status.classList.add("visually-hidden");
        } else {
            
            if (offset===0) {
                article.replaceChildren();
                article.insertAdjacentHTML('afterbegin',data.article);
                showmore.dataset.report = report;
                listenCwv();
            } else if (data.article) {            
                article.querySelector("tbody").insertAdjacentHTML('beforeend',data.article);
                listenCwv();
            }
            const tbody = article.querySelector("tbody");
            if (tbody.childElementCount >= data.count) {
                showmore.classList.add("visually-hidden");
                showmore.disabled = true;
            } else {
                showmore.disabled = false;
                showmore.dataset.offset = data.offset;
            }
            status.textContent = tbody.childElementCount + " / " + data.count;
            status.classList.remove("visually-hidden");
            showmore.classList.remove("visually-hidden");
        }
    })
    .catch((error) => {
            handleError(error);
    });
}

/*
** COMMON ENTRY POINT FOR HANDLING REPORTS
*/
reportlist.addEventListener("click", (e) => {
    if (e.target.dataset.report) {
        getReport(e.target.dataset.report, 0);
    }
})

/*
** "SHOW MORE" REPORT BUTTON. PREVENT DOUBLE CLICKS
*/
showmore.addEventListener("click", (e) => {
    if (e.detail===1) {
        getReport(showmore.dataset.report, showmore.dataset.offset);
    }
})