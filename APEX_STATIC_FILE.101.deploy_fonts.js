import { dialog_header, dialog_article } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

const result = (ele) => {
	const span = ele.parentElement.querySelector("span");
	if (ele.checked) {
		span.replaceChildren();
		span.insertAdjacentHTML('afterbegin','&#10060;');
	} else {
		span.replaceChildren();
		span.insertAdjacentHTML('afterbegin','&#9989;');
	}
}

export const init = (fontfaces) => {

    /*
    **  LOAD FONTS FOR CATEGORY SELECT LIST
    */
    for (const fontface of fontfaces) {
        const fontFile = new FontFace(fontface.family,fontface.url);
        document.fonts.add(fontFile);
        fontFile.load();
    };

    dialog_article.addEventListener("change", (e) => {
        /*
        ** ANY CHANGE REQUIRES REBUILDING LIST Of FONT NAMES
        */
        const name = e.target.getAttribute("id");
        const context = name.split("-")[0];

        const variable = document.getElementById(context + "-variable").checked ? 0 : 1;
	    const italic = document.getElementById(context + "-italic").checked ? 0 : 1;
        
        /* 
        ** SWITCHES FOR VARIABLE FONT AND FONTS WITH ITALIC
        */
        if (name.includes("variable")) {
            result(e.target);
        }

        if (name.includes("italic")) {
            result(e.target);
        }

        /* 
        ** USER SELECTS FONT CATEGORY - UPDATE ADJACENT SELECT WITH NEW FAMILY OPTIONS 
        */
        if (name.includes("font_category")) {
            const query = "?category=" + e.target.value + "&font=0&context=" + context + "&variable=" + variable;
            callAPI('fonts/:ID/:PAGE','GET', query)
                .then((data) => {
                    const family = document.getElementById(context + "-font-family");
                    let index = family.options.length;
                    while (index--) {
                        family.remove(index);
                    }
                    family.insertAdjacentHTML('beforeend',data.content);
                })
                .catch((error) => {
                    handleError(error);
                });
        /* 
        ** USER SELECTS FONT FAMILY - LOAD SELECTED FONT AND SET CSS ROOT PROPERTY
        */
        } else if (name.includes("font_family")) {
            if (!e.target.value) {
                return;
            }
             const loader = e.target.closest("fieldset").querySelector(".loader");
            loader.style.opacity=1;
            const query = "?category=null&font=" + e.target.value + "&context=" + context + "&variable=" + variable;
            callAPI('fonts/:ID/:PAGE','GET', query)
                .then((data) => {
                    /*
                    data.axes.forEach((axis) => {
                        const label = e.target.closest("fieldset").querySelector("[for$='"+axis.name+"']");
                        const input = label.querySelector("input");
                        if (axis.max) {
                            label.classList.remove("visually-hidden");
                            input.disabled = false;
                            input.setAttribute("min",axis.min);
                            input.setAttribute("max",axis.max);
                            // input.value = axis.name==="ital" ? 0 : Math.round(axis.min+((axis.max-axis.min)/2));
                        } else {
                            label.classList.add("visually-hidden");
                            input.disabled = true;
                        }
                    })
                    */
                    if (data.info) {
                        const info_id = context + "-info";
                        const info = document.getElementById(info_id);
                        info.textContent = data.info;
	                    info.showPopover();
                    } else {
                        const font_family = e.target.options[e.target.selectedIndex].text;
                        for (const url of data.urls) {
                            const fontFile = new FontFace(font_family,url);
                            document.fonts.add(fontFile);
                            fontFile.load();
                        };
                        document.fonts.ready.then(()=>{
                            console.log(`Loaded ${font_family}`);
                            document.documentElement.style.setProperty('--font-family-' + name.split("_")[0], font_family); 
                        });
                    }
                    loader.style.opacity=0;
                })
                .catch((error) => {
                    loader.style.opacity=0;
                    handleError(error);
                });
        }

    });
}