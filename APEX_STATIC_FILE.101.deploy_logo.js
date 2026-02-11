/*
**  WEBSITE LOGO
*/
import { dialog_article, dialog_footer, initDialog } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let endpoint;
let logo_type;

const logo = document.querySelector(".logo");

/*
**  CLICK PUBLISH BUTTON
*/
let isSending = false;

const footerHandler = async (e) => {
    if (e.target.classList.contains("reload")) {
        window.location.reload();
        return;
    }
    if (e.target.classList.contains("publish")) {
        if (isSending) {
            console.log("Prevent double sends");
            return;
        }
        const live=dialog_footer.querySelector("[aria-live]");
        const loader = dialog_footer.querySelector(".loader");

        isSending = true;
        live.textContent = e.target.dataset.processing;
        loader.style.opacity=1;

        callAPI("publish-website/:ID", "POST", {})
            .then((data) => {
                isSending = false;
                loader.style.opacity=0;        
                live.replaceChildren();
                if (data.link) {
                    live.insertAdjacentHTML('beforeend',data.link);
                    live.style.color = "green";
                }
                if (data.message) {
                    live.insertAdjacentHTML('beforeend',data.message);
                    live.style.color = "red";
                }
            })
            .catch((error) => {
                loader.style.opacity=0;
                handleError(error);
            });
        }
};

/*
** LOAD SELECTED IMAGE
*/
const loadImg = (src) => {
    let img = logo.querySelector("img");
    if (!img) {
        logo.textContent = "";
        img = document.createElement("img");
        img.setAttribute("alt","");
        logo.appendChild(img);
    }
    img.src = src;
}

/*
** LOAD SELECTED FONT
*/
const loadFont = (menu, text) => {
    logo.querySelector("img")?.remove();
    const fontFile = new FontFace(text,menu);
    document.fonts.add(fontFile);
    fontFile.load();
    logo.textContent = text;
    document.documentElement.style.setProperty('--font-family-logo', text); 
}

/*
** UPDATE DATABASE ON ALL CHANGE EVENTS
*/
const changeHandler = (e) => {
    const id = e.target.getAttribute("id");

    const value = (e.target.tagName === "SELECT") ? e.target.options[e.target.selectedIndex].value : e.target.value;

    callAPI(endpoint,"PUT",{column_name:id,column_value:value})
        .then((data) => {
            if (id === "logo-img-id") {
                loadImg(e.target.options[e.target.selectedIndex].querySelector("img").src);
            }
            else if (id === "logo-font-id") {
                loadFont(data.menu, e.target.options[e.target.selectedIndex].text);
            }
            else if (id === "logo-font-text") {
                loadFont(data.menutext, e.target.value);
            }

            const live=dialog_footer.querySelector("[aria-live]");
            live.replaceChildren();
            live.insertAdjacentHTML('beforeend',data.message);
        })
        .catch((error) => {
            handleError(error);
        });
}

/*
** UPDATE UI ON INPUT EVENTS
*/
const inputHandler = (e) => {
    const id = e.target.getAttribute("id");

    if (id === "logo-font-size") {
        document.documentElement.style.setProperty('--logo-font-size', e.target.value + 'cqi');
    }
    else if (id === "logo-font-wght") {
        document.documentElement.style.setProperty('--logo-font-wght', e.target.value); 
    }
    else if (id === "logo-img-corner-shape") {
        const seValue = `superellipse(${e.target.value})`;
        document.documentElement.style.setProperty('--logo-img-corner-shape', seValue); 
    }
    else if (id === "logo-img-border-radius") {
        const brValue = `${e.target.value}px`;
        document.documentElement.style.setProperty('--logo-img-border-radius', brValue); 
    }
}

export const init = (element) => {
    endpoint = element.dataset.endpoint;
    logo_type = element.dataset.logo;

    callAPI(endpoint,"GET", "?logo=" + logo_type)
        .then((data) => {
            initDialog(data);
            dialog_footer.addEventListener("click", footerHandler);
            dialog_article.addEventListener("change", changeHandler);
            dialog_article.addEventListener("input", inputHandler);
        })
        .catch((error) => {
            handleError(error);
        });
}