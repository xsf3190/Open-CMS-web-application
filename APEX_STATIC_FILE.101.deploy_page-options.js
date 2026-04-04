/*
**  GENERIC OPTIONS MODULE. FUNCTIONALITY DEPENDS ON PAGE TYPE - BLOG POST, NORMAL PAGE, ETC
*/

import { dialog_article, dialog_footer, initDialog, footerHandler, liveRegion } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let endpoint;

export const init = (element) => {
    endpoint = element.dataset.endpoint;
    
    callAPI(endpoint, "GET")
    .then((data) => {
        initDialog(data);
        dialog_footer.addEventListener("click", footerHandler);
        dialog_article.addEventListener("change", changeHandler);
        dialog_article.addEventListener("input", inputHandler);
        dialog_article.addEventListener("click", clickHandler);
    })
    .catch((error) => {
        handleError(error);
    });
}

const changeHandler = (e) => {
    callAPI(endpoint, "PUT", {name:e.target.getAttribute("name"), value:e.target.value})
        .then((data) => {
            liveRegion(data);
        })
        .catch((error) => {
            handleError(error);
        });
}

/*
**  DOES NOTHING !
*/
const clickHandler = () => {
    console.log("clickHandler");
};

/*
**  INPUT HANDLER SHOWS USER WHAT THEY'VE DONE
*/
const inputHandler = (e) => {
    const id = e.target.getAttribute("id");

    if (id === "max-width") {
        document.documentElement.style.setProperty(`--${id}`, e.target.value + "px");  
    }
    else if (id === "img-corner-shape") {
        const seValue = `superellipse(${e.target.value})`;
        document.documentElement.style.setProperty('--img-corner-shape', seValue); 
    }
    else if (id === "img-border-radius") {
        const brValue = `${e.target.value}px`;
        document.documentElement.style.setProperty('--img-border-radius', brValue); 
    }
};