/*
**  UPDATE STYLES FOR ALL PAGES OR CURRENT PAGE
*/
import { dialog_article, dialog_footer, initDialog, liveRegion } from "deploy_elements";
import { callAPI } from "deploy_callAPI";

let endpoint, main_style_id;

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
    console.log("Ignore in[ut handler");
}

/*
**  CHANGE HANDLER
*/
export const changeHandler = (e) => {
    if (e.target.matches("[name='scope']")) return;

    if (e.target.matches("#styles")) {
        /* Remove any adjacent input control first */
        e.target.nextElementSibling.replaceChildren();
        main_style_id = e.target.options[e.target.selectedIndex].getAttribute("value");
        if (main_style_id) {
            callAPI(endpoint,'GET',"?style="+main_style_id+"&scope="+getScope())
            .then((data) => {
                if (data.controls) {
                    const control = e.target.nextElementSibling;
                    control.replaceChildren();
                    control.insertAdjacentHTML('afterbegin',data.controls);
                }
            });
        }
        return;
    }

    if (e.target.tagName==="INPUT") {
        const scope = getScope();
        callAPI(endpoint,'POST',{scope: scope, main_style_id: main_style_id, property:e.target.id, style_id:e.target.value})
        .then((data) => {
            liveRegion(data);
            if (data.properties) {
                setProperties(data.properties);
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