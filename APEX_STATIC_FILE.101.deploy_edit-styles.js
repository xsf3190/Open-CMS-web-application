/*
**  UPDATE STYLES FOR ALL PAGES OR CURRENT PAGE
*/
import { dialog_article, dialog_footer, initDialog, liveRegion } from "deploy_elements";
import { callAPI } from "deploy_callAPI";

let endpoint, style_id;

export const init = (e) => {
    endpoint = e.dataset.endpoint;

    callAPI(endpoint,'GET')
        .then((data) => {
            initDialog(data);
        })
}

const getContext = () => {
    return document.querySelector("[name='context']:checked").getAttribute("id");
}

/*
** INPUT HANDLER
*/
export const inputHandler = (e) => {
    if (e.target.tagName==="INPUT" && e.target.type==="range") {
        document.documentElement.style.setProperty(`--${e.target.id}`, `${e.target.value}px`);
    }
}

/*
**  CHANGE HANDLER
*/
export const changeHandler = (e) => {
    if (e.target.matches("[name='context']")) return;

    if (e.target.matches("#styles")) {
        style_id = e.target.options[e.target.selectedIndex].getAttribute("value");
        if (style_id) {
            callAPI(endpoint,'GET',"?style="+style_id)
            .then((data) => {
                const control = e.target.nextElementSibling;
                control.replaceChildren();
                control.insertAdjacentHTML('afterbegin',data.input);
                control.querySelector("input").focus();
            });
        }
        return;
    }
    
    if (e.target.tagName==="INPUT" && e.target.type==="color") {
        document.documentElement.style.setProperty(`--${e.target.id}`, e.target.value);
    }

    if (e.target.tagName==="INPUT") {
        callAPI(endpoint,'POST',{context: getContext(), style_id: style_id, property:e.target.id, value:e.target.value})
            .then((data) => {
                liveRegion(data);
            });
    }
}

/*
** BUTTON CLICK EVENT HANDLER
*/
export const clickHandler = async (e) => {
    console.log("DO NOTHING");
}