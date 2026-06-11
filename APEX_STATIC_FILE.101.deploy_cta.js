/*
**  USER CLICKS CALL TO ACTION BUTTON
*/
import { callAPI, handleError } from "deploy_callAPI";

/* This is actually the click event on CTA button */
export const init = (e) => {
    const form = document.getElementById("cta");
    const obj = {
        email: form.querySelector("[name='email']").value,
        action: e.dataset.action
    };
    const live=form.querySelector("[aria-live]");

    callAPI("cta/:ID","POST",obj)
    .then((data) => {
        live.textContent = data.message;
    })
    .catch((error) => {
        handleError(error);
    });
    
}