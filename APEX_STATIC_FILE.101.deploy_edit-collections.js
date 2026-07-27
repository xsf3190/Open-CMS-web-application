/*
**  ADD / CHANGE / DELETE PAGES
*/
import { dialog_article, dialog_footer, initDialog } from "deploy_elements";
import { callAPI } from "deploy_callAPI";

let endpoint, pages, isSending;

export const init = (e) => {
    endpoint = e.dataset.endpoint;

    callAPI(endpoint,'GET')
        .then((data) => {
            initDialog(data);
            pages = dialog_article.querySelector("fieldset.pages");
            isSending = false;
        })
}

/*
** INPUT HANDLER - WRITE USER'S INPUT INTO RADIO CONTROL NAVIGATION LABEL
*/
export const inputHandler = (e) => {
    console.log("DO NOTHING");
}

/*
**  CHANGE HANDLER
*/
export const changeHandler = (e) => {
    if (e.target.matches("[name='page']")) {
        console.log("changeHandler",e.target);
    }
}

/*
** BUTTON CLICK EVENT HANDLERS
*/
export const clickHandler = async (e) => {

    if (e.target.matches(".save")) {
        /* SAVE CHANGES AND PROMPT USER TO PUBLISH */

        if (isSending) {
            console.log("Prevent double sends");
            return;
        }
        const live=dialog_footer.querySelector("[aria-live]");
        const loader = dialog_footer.querySelector(".loader");
        
        isSending = true;
        live.textContent = e.target.dataset.processing;
        loader.style.opacity=1;

        await callAPI(endpoint,'POST', {})
            .then((data) => {
                isSending = false;
                loader.style.opacity=0;        
                live.replaceChildren();
                live.textContent = data.message;
                if (data.published) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                }
            })
    }
}