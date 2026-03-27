/*
**  WEBSITE LOGO
*/
import { dialog_article, dialog_footer, initDialog, footerHandler, liveRegion } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let endpoint;

const logo = document.querySelector(".logo");

/*
** LOAD SELECTED IMAGE
*/
const loadImg = (src) => {
    let img = logo.querySelector("img");
    if (!img) {
        logo.textContent = "";
        img = document.createElement("img");
        img.setAttribute("alt","");
        img.dataset.type = "img";
        logo.appendChild(img);
    }
    img.src = src;
}

/*
** UPDATE DATABASE ON ALL CHANGE EVENTS
*/
const changeHandler = async (e) => {
    let id, value; 

    if (e.target.getAttribute("type")==="radio") {
        id=e.target.getAttribute("name");
        value=e.target.id;
    } else {
        id = e.target.getAttribute("id");
        value = (e.target.tagName === "SELECT") ? e.target.options[e.target.selectedIndex].value : e.target.value;
    }

    callAPI(endpoint,"PUT",{column_name:id,column_value:value})
        .then((data) => {
            if (data.logoform) {
                const logoform = document.getElementById("logoform");
                logoform.replaceChildren();
                logoform.insertAdjacentHTML('beforeend',data.logoform);
            } 
            else if (id === "logo-img-id") {
                loadImg(e.target.options[e.target.selectedIndex].querySelector("img").src);
            }
            else if (id === "logo-svg") {
                logo.replaceChildren();
                logo.insertAdjacentHTML('beforeend',value);
            }

            liveRegion(data);
        })
        .catch((error) => {
            handleError(error);
        });
}

/*
**  BUTTON HANDLER
*/
const clickHandler = (e) => {
    if (!e.target.id === "apply-svg") return;

    const logo_svg = document.getElementById("logo-svg");

    callAPI(endpoint,"PUT",{column_name:"logo-svg",column_value:logo_svg.value})
        .then(() => {
            logo.replaceChildren();
            logo.insertAdjacentHTML('beforeend',logo_svg.value);
        })
}

/*
** UPDATE UI ON INPUT EVENTS
*/
const inputHandler = (e) => {
    const id = e.target.getAttribute("id");
    
    if (id === "logo-img-corner-shape") {
        const seValue = `superellipse(${e.target.value})`;
        document.documentElement.style.setProperty('--logo-img-corner-shape', seValue); 
    }
    else if (id === "logo-img-border-radius") {
        const brValue = `${e.target.value}px`;
        document.documentElement.style.setProperty('--logo-img-border-radius', brValue); 
    }
    else if (id === "logo-img-inline-size") {
        const cqiValue = `${e.target.value}cqi`;
        document.documentElement.style.setProperty('--logo-img-inline-size', cqiValue); 
    }
}

export const init = (element) => {
    endpoint = element.dataset.endpoint;

    callAPI(endpoint,"GET")
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