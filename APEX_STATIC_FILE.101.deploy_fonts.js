import { dialog_article, dialog_footer, initDialog, footerHandler, liveRegion } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let endpoint;
let context="text";

export const init = (element) => {
    endpoint = element.dataset.endpoint;
    callAPI(endpoint,"GET")
        .then((data) => {
            initDialog(data);
            dialog_article.addEventListener("change", changeHandler);
            dialog_article.addEventListener("click", clickHandler);
            dialog_article.addEventListener("input", inputHandler);
            dialog_footer.addEventListener("click", footerHandler);
        })
        .catch((error) => {
            handleError(error);
        });
}

/*
** LOAD SELECTED FONT AND CONTROLS
*/
const loadFont = (data) => {
    let family = document.querySelector("#family selectedContent").textContent;
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
        document.documentElement.style.setProperty(`--font-family-${context}`, family);
        console.log(`Loaded ${family} for ${context}`);
    });
    if (data.variations) {
        const font_variations = dialog_article.querySelector(".font-variations");
        font_variations.replaceChildren();
        font_variations.insertAdjacentHTML('afterbegin',data.variations);

        /* Reset font custom variables if new font loaded */
        if (context==="logo") {
            document.documentElement.style.setProperty("--logo-font-style", "normal");
        }
        
        document.documentElement.style.setProperty(`--${context}-font-wght`, 400);
        document.documentElement.style.setProperty(`--${context}-font-wdth`, 100);
    }
}

/*
** COMMIT ALL CHANGES TO DATABASE AND REFLECT IN UI
*/
const changeHandler = (e) => {
    const obj={context:context};
    
    if (e.target.getAttribute("type")==="radio") {
        obj.id=e.target.getAttribute("name");
        obj.value=e.target.id;
    } else {
        obj.id=e.target.id;
        obj.value=e.target.value;
    }

    callAPI(endpoint,"PUT",obj)
        .then((data) => {
            /* Set "context" variable only when committed to database */
            if (obj.id==="context") {
                context=obj.value
            }
            if (data.capabilities) {
                const category = document.getElementById("capabilities");
                category.querySelector(`option[value="${data.capabilities}"]`).selected=true
            }
            if (data.family) {
                const family = document.getElementById("family");
                family.replaceChildren();
                family.insertAdjacentHTML("afterbegin",data.family);
            }
            if (data.variations) {
                const variations = document.querySelector(".font-variations");
                variations.replaceChildren();
                variations.insertAdjacentHTML("afterbegin",data.variations);
            }
            if (data.urls) {
                loadFont(data);
            }
            if (obj.id.endsWith("size")) {
                const sizeValue = (obj.id.includes("font")) ? `--step-${value}` : value;
                document.documentElement.style.setProperty(`--${id}`, `var(${sizeValue})`); 
            }
            else if (obj.id==="wght" && !e.target.classList.contains("slider")) {
                document.documentElement.style.setProperty(`--${context}-font-wght`, value);
            }

            liveRegion(data);
        })
        .catch((error) => {
            handleError(error);
        });
};

/*
**  BUTTON HANDLER. ALL TOGGLE SWITCHES ARE IMPLEMENTED AS BUTTONS FOR ACCESSIBILITY
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
    callAPI(endpoint,"PUT",{context:context, id:id, value:value})
        .then((data) => {
            if (id==="ital") {
                const varStyle = (value==="0") ? "normal" : "italic";
                document.documentElement.style.setProperty(`--${context}-font-style`, varStyle);
            } else {
                document.documentElement.style.setProperty(`--${context}-font-${id}`, value); 
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
        document.documentElement.style.setProperty(`--${context}-font-${id}`, e.target.value); 
    }
    else if (id === "logo-font-text") {
        logo.textContent = e.target.value;
    }
}