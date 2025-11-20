/*
**  FETCH LATEST CONTENT WHEN OWNER VISITS EDITED PAGE - 
*/
import { header, main, footer, dropdown } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

export const init = () => {
    console.log("fetching latest edited content");
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
        })
        .catch((error) => {
            handleError(error);
        })
}