/* **************************************************************************** */
/* CREATE NEW WEBSITE. DOMAIN NAME OPTIONAL, DEFAULTS TO RANDOMLY GENERATED NAME                             */
/* **************************************************************************** */
import { callAPI } from "deploy_callAPI";
import { liveRegion, output_dialog, dialog_footer, initDialog } from "deploy_elements";

let endpoint;

let isSending = false;

/*
**  BUTTON HANDLER
*/
export const clickHandler = (e) => {
    if (e.target.tagName !== "BUTTON") return;

    if (isSending) {
        console.log("Prevent double sends");
        return;
    }
    isSending = true;

    const live=dialog_footer.querySelector("[aria-live]");
    const loader=dialog_footer.querySelector(".loader");

    live.textContent = e.target.dataset.processing;
    loader.style.opacity=1;

    const input = e.target.closest("fieldset").querySelector("input");
    
    callAPI(endpoint,"PUT",{id:input.id, value:input.value})
        .then((data) => {
            isSending = false;
            loader.style.opacity=0;
            liveRegion(data);
            if (data.token) {
                output_dialog.addEventListener("close", () => {
                    const url = `https://${input.value}.netlify.app?token=${data.token}&refresh=${data.refresh}&menulist=${data.menulist}`;
                    window.location.replace(url);
                });
            }
            
        })
}

export const init = (element) => {
    endpoint = element.dataset.endpoint;

    callAPI(endpoint,"GET")
        .then((data) => {
            initDialog(data);
        })
}

export const inputHandler = (e) => {
    console.log("DO NOTHING");
}

export const changeHandler = (e) => {
    console.log("DO NOTHING");
}