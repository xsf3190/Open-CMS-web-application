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

/*
** SET CUSTOM VARIABLES
*/
export const setProperties = (properties) => {
    for (const property of properties) {
        document.documentElement.style.setProperty(property.name,property.value);
    }
}

const getScope = () => {
    return document.querySelector("[name='scope']:checked").getAttribute("id");
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
    if (e.target.matches("[name='scope']")) return;

    if (e.target.matches("#styles")) {
        /* Remove any adjacent input control first */
        e.target.nextElementSibling.replaceChildren();
        style_id = e.target.options[e.target.selectedIndex].getAttribute("value");
        if (style_id) {
            callAPI(endpoint,'GET',"?style="+style_id+"&scope="+getScope())
            .then((data) => {
                if (data.controls) {
                    const control = e.target.nextElementSibling;
                    control.replaceChildren();
                    control.insertAdjacentHTML('afterbegin',data.controls);
                    // control.querySelector("input").focus();
                }
            });
        }
        return;
    }

    if (e.target.tagName==="INPUT") {
        callAPI(endpoint,'POST',{scope: getScope(), style_id: style_id, property:e.target.id, value:e.target.value})
        .then((data) => {
            liveRegion(data);
            if (data.properties) {
                setProperties(data.properties);
                // localStorage.setItem("fluid-properties",JSON.stringify(data.properties));
            }
        });
        return;
    }
}

/*
** BUTTON CLICK EVENT HANDLER
*/
export const clickHandler = async (e) => {
    console.log("DO NOTHING");
}