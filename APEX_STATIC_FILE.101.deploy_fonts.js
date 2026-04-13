import { initDialog, liveRegion } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let endpoint;

export const init = (element) => {
    endpoint = element.dataset.endpoint;
    callAPI(endpoint,"GET")
        .then((data) => {
            initDialog(data);
            replaceOptions("family",data.options);
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

const getSelectedFont = () => {
    const family = document.getElementById("family");
    return family.options[family.selectedIndex]?.getAttribute("value");
}

/*
** REPLACE FONT FAMILY options
*/
const replaceOptions = (id, options) => {
    const family = document.getElementById(id);
    // remove existing options
    let index = family.options.length;
	while (index--) {
        if (family[index]) {
            family.remove(index);
        }
    }
    // load new options
    for (let i=0; i<options.length; i++) {
        family[i] = new Option(options[i].text,options[i].value,options[i].defaultSelected,options[i].selected);
        if (options[i].value>0) {
            family[i].style.fontFamily = `f${options[i].value}`;
        }
    }
}

/*
** LOAD @FONT-FACE RULES FOR SELECTED FONT
*/
export const loadFont = (urls,context) => {
    for (const fontface of urls) {
        const fontFile = new FontFace(fontface.family,fontface.source);
        fontFile.style = fontface.style;
        fontFile.weight = fontface.weight;
        if (fontface.stretch) {
            fontFile.stretch = fontface.stretch;
        }
        document.fonts.add(fontFile);
        console.log(`Loading ${fontface.family} for ${context}`);
        fontFile.load();
    };
    document.fonts.ready.then(()=>{
        localStorage.setItem(`${context}-font-urls`,JSON.stringify(urls));
    });
}

/*
** LOAD @FONT-FACE RULES FOR SELECTED FONT
*/
export const setProperties = (properties,context) => {
    for (const property of properties) {
        console.log(`Setting property ${property.name} to ${property.value}`);
        document.documentElement.style.setProperty(property.name,property.value);
    }
    localStorage.setItem(`${context}-font-properties`,JSON.stringify(properties));
}

/*
** COMMIT ALL CHANGES TO DATABASE AND REFLECT IN UI
*/
export const changeHandler = (e) => {
    if (e.target.value===0) return;

    const context = getContext();

    const obj={context:context, capabilities:getCapabilities(), font:getSelectedFont()};
    
    if (e.target.getAttribute("type")==="radio") {
        obj.id=e.target.getAttribute("name");
        obj.value=e.target.id;
    } else {
        obj.id=e.target.id;
        obj.value=e.target.value;
    }

    if (e.target.getAttribute("name")==="context") {
        document.getElementById("separator2").textContent = `Finesse ${context}`;
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
            if (data.options) {
                replaceOptions("family",data.options);
            }
            if (data.variations) {
                const variations = document.getElementById("variations");
                variations.replaceChildren();
                variations.insertAdjacentHTML("afterbegin",data.variations);
            }
            if (data.urls) {
                loadFont(data.urls,context);
            }
            if (data.properties) {
                setProperties(data.properties,context);
            }
            if (data.sample) {
                const sample = document.getElementById("sample");
                sample.replaceChildren();
                sample.insertAdjacentHTML("afterbegin",data.sample);
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
export const clickHandler = (e) => {
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

    callAPI(endpoint,"PUT",{context:context, category:getCategory(), font:getSelectedFont(), id:id, value:value})
        .then((data) => {
            if (data.options) {
                replaceOptions("family",data.options);
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
            if (data.properties) {
                setProperties(data.properties,context);
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
export const inputHandler = (e) => {
    const id = e.target.getAttribute("id");
    
    if (id==="family2" && e.target.value.length>1) {
        callAPI(endpoint,"POST",{value:e.target.value})
        .then((data) => {
            if (data.datalist) {
                const family2list = document.getElementById("family2list");
                family2list.replaceChildren();
                family2list.insertAdjacentHTML("afterbegin",data.datalist);
            }
        })    
    }

    if (id==="logo-font-text") {
        document.querySelector(".logo").textContent = e.target.textContent;
        callAPI(endpoint,"PUT",{context:getContext(), id:id, value:e.target.textContent})
        .then((data) => {
            liveRegion(data);
        })    
    }
    
    const context = getContext();
    
    if (e.target.classList.contains("slider")) {
        let value = e.target.value
        if (id==="wdth") {
            value+="%";
        }
        if (id==="slnt") {
            value=`oblique ${value}deg`;
        }
        document.documentElement.style.setProperty(`--${context}-font-${id}`, value);   
    }
}