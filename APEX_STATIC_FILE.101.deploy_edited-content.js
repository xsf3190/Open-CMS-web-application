/*
**  FETCH LATEST CONTENT AND STYLES WHEN OWNER VISITS EDITED PAGE
*/
import { header, main, footer } from "deploy_elements";
import { callAPI } from "deploy_callAPI";

export const init = () => {
    callAPI('edit-content/:ID/:PAGE',"GET")
        .then((data) => {
            if (data.header) {
                header.replaceChildren();
                header.insertAdjacentHTML("beforeend",data.header);
            }
            if (data.main) {
                main.replaceChildren();
                main.insertAdjacentHTML("beforeend",data.main);
            }
            if (data.footer) {
                footer.replaceChildren();
                footer.insertAdjacentHTML("beforeend",data.footer);
            }
            if (data.properties) {
                for (const property of data.properties) {
                    document.documentElement.style.setProperty(property.name,property.value);
                }
            }
        })
}