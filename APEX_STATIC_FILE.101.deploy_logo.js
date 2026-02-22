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
        img.dataset.type = "img";
        logo.appendChild(img);
    }
    img.src = src;
}

/*
** LOAD SELECTED FONT
*/
const loadFont = (data) => {
    let family = document.querySelector("#logo-font-id selectedContent").textContent;
    const wght = document.querySelector("#wght selectedContent");
    if (wght) {
        family+=" "+wght.textContent;
    }
    for (const fontface of data.urls) {
        const fontFile = new FontFace(family,fontface.source);
        fontFile.style = fontface.style;
        fontFile.weight = fontface.weight;
        if (fontface.stretch) {
            fontFile.stretch = fontface.stretch;
        }
        document.fonts.add(fontFile);
        fontFile.load();
    };
    document.fonts.ready.then(()=>{
        document.documentElement.style.setProperty('--font-family-logo', family);
        console.log(`Loaded ${family}`);
    });
    if (data.variations) {
        const font_variations = dialog_article.querySelector(".font-variations");
        font_variations.replaceChildren();
        font_variations.insertAdjacentHTML('afterbegin',data.variations);

        /* Reset font custom variables if new font loaded */
        document.documentElement.style.setProperty('--logo-font-style', "normal");
        document.documentElement.style.setProperty('--logo-font-wght', 400);
        document.documentElement.style.setProperty('--logo-font-wdth', 100);
    }
}

const liveRegion = (data) => {
    const live=dialog_footer.querySelector("[aria-live]");
    live.replaceChildren();
    live.insertAdjacentHTML('beforeend',data.message);
}

/*
** UPDATE DATABASE ON ALL CHANGE EVENTS
*/
const changeHandler = async (e) => {
    const id = e.target.getAttribute("id");

    const value = (e.target.tagName === "SELECT") ? e.target.options[e.target.selectedIndex].value : e.target.value;

    callAPI(endpoint,"PUT",{column_name:id,column_value:value})
        .then((data) => {
            if (data.urls) {
                loadFont(data);
            }
            if (id === "logo-img-id") {
                loadImg(e.target.options[e.target.selectedIndex].querySelector("img").src);
            }
            else if (id === "logo-svg") {
                logo.replaceChildren();
                logo.insertAdjacentHTML('beforeend',value);
            }
            else if (id.endsWith("size")) {
                const sizeValue = (id.includes("font")) ? "--step-" + value : value;
                document.documentElement.style.setProperty("--" + id, "var(" + sizeValue + ")"); 
            }
            else if (id==="wght" && !e.target.classList.contains("slider")) {
                document.documentElement.style.setProperty('--logo-font-wght', value);
            }

            liveRegion(data);
        })
        .catch((error) => {
            handleError(error);
        });
}

/*
**  BUTTON HANDLER. ALL BUTTONS ARE TOGGLE SWITCHES.
*/
const clickHandler = (e) => {
    if (!e.target.classList.contains("toggle")) return;

    const id = e.target.getAttribute("id");

    // if (!getComputedStyle(document.documentElement).getPropertyValue('--logo-font-' + id)) return;

    let value;
    const toggle = e.target;
    if (toggle.getAttribute("aria-pressed") == "false") {
        toggle.setAttribute("aria-pressed", "true");
        value = "1";
    } else {
        toggle.setAttribute("aria-pressed", "false");
        value = "0";
    }
    callAPI(endpoint,"PUT",{column_name:id,column_value:value})
        .then((data) => {
            if (id==="ital") {
                const varStyle = (value==="0") ? "normal" : "italic";
                document.documentElement.style.setProperty('--logo-font-style', varStyle);
            } else {
                document.documentElement.style.setProperty('--logo-font-' + id, value); 
            }
            liveRegion(data);
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
    
    if (e.target.classList.contains("slider")) {
        document.documentElement.style.setProperty("--logo-font-" + id, e.target.value); 
    }
    else if (id === "logo-font-text") {
        logo.textContent = e.target.value;
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
            dialog_article.addEventListener("click", clickHandler);
        })
        .catch((error) => {
            handleError(error);
        });
}