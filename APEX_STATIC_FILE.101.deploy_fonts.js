import { dialog_article, dialog_footer, initDialog, footerHandler, liveRegion } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let endpoint;

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

const getContext = () => {
    const context = document.querySelector("[name='context']:checked").getAttribute("id");
    return context;
}

const getCategory = () => {
    const index = document.getElementById("category").selectedIndex;
    const category = document.getElementById("category").options[index].getAttribute("value");
    return category;
}

const getCapabilities = () => {
    const capabilities = document.querySelectorAll(".capability");
    const arr = [...capabilities];
    const len = arr.length;
    let value=0;
    for (let i = 0; i < len; i++) {
        if (arr[i].getAttribute("aria-pressed")==="true") {
            value+=(2 ** (len-1-i));
        }
    }
    return value;
}

/*
** LOAD SELECTED FONT AND CONTROLS
*/
const loadFont = (data) => {
    let family = document.querySelector("#family selectedContent").textContent;
    const wght = document.querySelector("#wght selectedContent");
    const context = getContext();
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
}

/*
** COMMIT ALL CHANGES TO DATABASE AND REFLECT IN UI
*/
const changeHandler = (e) => {
    const obj={context:getContext(), capabilities: getCapabilities()};
    
    if (e.target.getAttribute("type")==="radio") {
        obj.id=e.target.getAttribute("name");
        obj.value=e.target.id;
    } else {
        obj.id=e.target.id;
        obj.value=e.target.value;
    }

    callAPI(endpoint,"PUT",obj)
        .then((data) => {
            if (data.category) {
                const category = document.getElementById("category");
                category.querySelector(`option[value="${data.category}"]`).selected=true;
            }
            if (data.capabilities) {
                for (const capability of data.capabilities) {
                    document.getElementById(capability.id).setAttribute("aria-pressed",capability.value);
                }
            }
            if (data.family) {
                const family = document.getElementById("family");
                family.replaceChildren();
                family.insertAdjacentHTML("afterbegin",data.family);
            }
            if (data.variations) {
                const variations = document.getElementById("variations");
                variations.replaceChildren();
                variations.insertAdjacentHTML("afterbegin",data.variations);
            }
            if (data.sample) {
                const sample = document.getElementById("sample");
                sample.replaceChildren();
                sample.insertAdjacentHTML("afterbegin",data.sample);
            }
            if (data.urls) {
                loadFont(data);
            }
            if (obj.id.endsWith("size")) {
                const sizeValue = (obj.id.includes("font")) ? `--step-${value}` : value;
                document.documentElement.style.setProperty(`--${id}`, `var(${sizeValue})`); 
            }
            else if (obj.id==="wght" && !e.target.classList.contains("slider")) {
                const context = getContext();
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

    const context = getContext();

    let id = e.target.getAttribute("id");
    let value;
    
    const toggle = e.target;
    if (toggle.getAttribute("aria-pressed") == "false") {
        toggle.setAttribute("aria-pressed", "true");
        value = "1";
    } else {
        toggle.setAttribute("aria-pressed", "false");
        value = "0";
    }

    /* compute total "capabilites" when any capability button clicked */
    if (e.target.classList.contains("capability")) {
        id="capabilities";
	    value=getCapabilities();
    }

    callAPI(endpoint,"PUT",{context:context, category:getCategory(), id:id, value:value})
        .then((data) => {
            if (data.family) {
                const family = document.getElementById("family");
                family.replaceChildren();
                family.insertAdjacentHTML("afterbegin",data.family);
            }
            if (data.variations) {
                const variations = document.getElementById("variations");
                variations.replaceChildren();
                variations.insertAdjacentHTML("afterbegin",data.variations);
            }
            if (data.sample) {
                const sample = document.getElementById("sample");
                sample.replaceChildren();
                sample.insertAdjacentHTML("afterbegin",data.sample);
            }
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
    const context = getContext();
    
    if (e.target.classList.contains("slider")) {
        let value = e.target.value
        if (id==="wdth") {
            value+="%";
        }
        document.documentElement.style.setProperty(`--${context}-font-${id}`, value);   
    }
    if (id === "logo-font-text") {
        logo.textContent = e.target.value;
    }
}