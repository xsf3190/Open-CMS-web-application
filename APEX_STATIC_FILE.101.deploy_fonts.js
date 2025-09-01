import { dialog_header, dialog_article } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

const show_result = (ele) => {
	const span = ele.parentElement.querySelector("span");
	if (ele.checked) {
		span.replaceChildren();
		span.insertAdjacentHTML('afterbegin','&#10060;');
	} else {
		span.replaceChildren();
		span.insertAdjacentHTML('afterbegin','&#9989;');
	}
}

const buildFontList = (context) => {
    const variable = document.getElementById(context + "-variable").checked ? 0 : 1;
	const italic = document.getElementById(context + "-italic").checked ? 0 : 1;
    const category = document.getElementById(context + "-font-category").value;

    const query = "?category=" + category + "&context=" + context + "&variable=" + variable + "&italic=" + italic;

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
}

export const init = () => {

    /*
    **  LOAD FONTS FOR CATEGORY SELECT LIST
    */
    // for (const fontface of fontfaces) {
    //     const fontFile = new FontFace(fontface.family,fontface.url);
    //     document.fonts.add(fontFile);
    //     fontFile.load();
    // };

    dialog_article.addEventListener("change", (e) => {
        /*
        ** ANY CHANGE REBUILDS LIST Of FONT NAMES
        */
        const name = e.target.getAttribute("id");
        const context = name.split("-")[0];

        /* 
        ** SWITCH FOR VARIABLE FONTS
        */
        if (name.includes("variable")) {
            show_result(e.target);
            buildFontList(context);
        }

        /* 
        ** SWITCH FOR FONTS WITH ITALIC
        */
        if (name.includes("italic")) {
            show_result(e.target);
            buildFontList(context);
        }

        /* 
        ** USER SELECTS FONT CATEGORY
        */
        if (name.includes("font-category")) {
            buildFontList(context);
        }
        
        /* 
        ** USER SELECTS FONT FAMILY - LOAD SELECTED FONT AND SET CSS ROOT PROPERTY
        */
        if (name.includes("font-family")) {
            if (!e.target.value) {
                return;
            }
            const loader = e.target.closest("fieldset").querySelector(".loader");
            loader.style.opacity=1;
            const obj = {};
            obj.font_id = e.target.value;
            obj.context = context;
            callAPI('fonts/:ID/:PAGE','PUT', obj)
                .then((data) => {
                    if (data.info) {
                        const info_id = context + "-info";
                        const info = document.getElementById(info_id);
                        info.textContent = data.info;
	                    info.showPopover();
                    } else {
                        const font_family = e.target.options[e.target.selectedIndex].text;
                        if (font_family!=="system-ui") {
                            for (const url of data.urls) {
                                const fontFile = new FontFace(font_family,url);
                                document.fonts.add(fontFile);
                                fontFile.load();
                            };
                            document.fonts.ready.then(()=>{
                                console.log(`Loaded ${font_family}`);
                            });
                        }
                        document.documentElement.style.setProperty('--font-family-' + context, font_family); 
                    }
                    loader.style.opacity=0;
                })
                .catch((error) => {
                    loader.style.opacity=0;
                    handleError(error);
                });
        }
        if (name.includes("wght")) {
            console.log("change event",e.target.value); /* finger off - update website_font*/
        }

    });
    
    dialog_article.addEventListener("input", (e) => {
        const name = e.target.getAttribute("id");
        const context = name.split("-")[0];
        if (name.includes("wght")) {
            document.documentElement.style.setProperty("--font-weight-" + context, e.target.value); 
        }
    });
}