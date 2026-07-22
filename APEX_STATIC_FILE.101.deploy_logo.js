/*
**  WEBSITE LOGO
*/
import { initDialog, form, liveRegion } from "deploy_elements";
import { callAPI } from "deploy_callAPI";

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
** GET NEW FORM IF USER SELECTS "logo-type"
*/
export const changeHandler = async (e) => {
    const id = e.target.getAttribute("id");
    if (e.target.getAttribute("name") === "logo-type") {
        callAPI(endpoint,"GET",`?logotype=${id}`)
            .then((data) => {
                const logoform = document.getElementById("logoform");
                logoform.replaceChildren();
                logoform.insertAdjacentHTML('beforeend',data.logoform);
                switch (id) {
                    case "font":
                        logo.textContent = logoform.querySelector("[name='logo_font_text']").value;
                        document.documentElement.style.setProperty('--logo-font-size', logoform.querySelector("[name='logo_font_size']").value + "vw");
                        break;
                    case "img":
                        if (logoform.querySelector("selectedcontent>img")) {
                            loadImg(logoform.querySelector("selectedcontent>img").getAttribute("src"));
                            document.documentElement.style.setProperty('--logo-img-corner-shape', "superellipse(" + logoform.querySelector("[name='logo_img_corner_shape']").value + ")");
                            document.documentElement.style.setProperty('--logo-img-border-radius', logoform.querySelector("[name='logo_img_border_radius']").value + "px");
                            document.documentElement.style.setProperty('--logo-img-block-size', logoform.querySelector("[name='logo_img_block_size']").value + "vh");
                        }
                        break;
                    case "svg":
                        logo.replaceChildren();
                        logo.insertAdjacentHTML('beforeend',logoform.querySelector("[name='logo_svg']").value);
                        document.documentElement.style.setProperty('--logo-img-block-size', logoform.querySelector("[name='logo_img_block_size']").value + "vh");
                        break;
                    case "null":
                        logo.textContent = "";
                        break;
                }
                liveRegion(data);
            })
    } else if (id === "logo-img-id") {
        loadImg(e.target.options[e.target.selectedIndex].querySelector("img").src);
    } else if (id === "svg") {
        logo.replaceChildren();
        logo.insertAdjacentHTML('beforeend',e.target.value);
    }
}

/*
**  BUTTON HANDLER
*/
export const clickHandler = (e) => {
    if (e.target.tagName !== "BUTTON") return;

    const formData = new FormData(form);
    const formObj = Object.fromEntries(formData);
    const logo_type = form.querySelector("[name='logo-type']:checked").getAttribute("id");
    formObj.logo_type = logo_type;
    if (formObj.logo_type === "img") {
        const img = form.querySelector("[name='logo_img_id']")
        formObj.logo_img_id = img.options[img.selectedIndex].value;
    }

    callAPI(endpoint,"PUT",formObj)
        .then((data) => {
            if (logo_type === "null") {
                logo.textContent = "";
            }
            liveRegion(data);
        })
}

/*
** UPDATE UI ON INPUT EVENTS
*/
export const inputHandler = (e) => {
    const id = e.target.getAttribute("id");
    
    if (id === "logo-img-corner-shape") {
        const seValue = `superellipse(${e.target.value})`;
        document.documentElement.style.setProperty('--logo-img-corner-shape', seValue); 
    }
    else if (id === "logo-img-border-radius") {
        const brValue = `${e.target.value}px`;
        document.documentElement.style.setProperty('--logo-img-border-radius', brValue); 
    }
    else if (id === "logo-img-block-size") {
        const vhValue = `${e.target.value}vh`;
        document.documentElement.style.setProperty('--logo-img-block-size', vhValue); 
    }
    else if (id==="logo-font-text") {
        logo.textContent = e.target.value;
    }
    else if (id==="logo-font-size") {
        const vwValue = `${e.target.value}vw`;
        document.documentElement.style.setProperty('--logo-font-size', vwValue);
    }
    else if (id==="logo-svg") {
        logo.replaceChildren();
        logo.insertAdjacentHTML('beforeend',e.target.value);
    }
}

export const init = (element) => {
    endpoint = element.dataset.endpoint;

    callAPI(endpoint,"GET","?logotype=")
        .then((data) => {
            initDialog(data);
        })
}