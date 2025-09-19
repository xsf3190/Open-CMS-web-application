/*
**  SET BACKGROUND COLOR FOR HEADER, MAIN AND FOOTER ELEMENTS 
**  probably include curves and waves later - https://www.shapedivider.app/
*/
import { dialog_article, initDialog } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";


/*
** USER CHANGES ELEMENT BACKGROUND COLOR - UPDATE DATABASE AND UI
*/
const colorHandler = e => {
    const id = e.target.id;

    if (['header-background-color','main-background-color','footer-background-color'].includes(id)) {
        console.log("id",id);
        document.documentElement.style.setProperty('--' + id,  e.target.value); 
        const obj = {};
        obj.background_color = e.target.value;
        obj.content=id;
        callAPI("color/:ID/:PAGE","PUT", obj)
        .then ( (data) => {
            console.log("updated backgroundcolor for " +id,data);
        })
        .catch((error) => {
            handleError(error);
        });
    }
};

export const init = (id) => {
    callAPI("color/:ID/:PAGE","GET", "?content=" + id)
        .then((data) => {
            initDialog(data);
            dialog_article.addEventListener("input", colorHandler);
        })
        .catch((error) => {
            handleError(error);
        });
}