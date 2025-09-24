/*
**  FETCH LATEST CONTENT WHEN USER REVISITS EDITED PAGE - 
*/
import { header, main, footer, dropdown } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

export const init = () => {
    callAPI('edit-content/:ID/:PAGE',"GET")
        .then((data) => {
            header.replaceChildren();
            header.insertAdjacentHTML("beforeend",data.header);
            main.replaceChildren();
            main.insertAdjacentHTML("beforeend",data.main);
            footer.replaceChildren();
            footer.insertAdjacentHTML("beforeend",data.footer);
            dropdown.querySelector(".edit-content").click();
        })
        .catch((error) => {
            handleError(error);
        })
}