import { dialog_article, initDialog } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

const endpoint = "fonts/:ID/:PAGE";

export const init = () => {
    callAPI(endpoint,"GET", "?context=HTML")
        .then((data) => {
            initDialog(data);
            dialog_article.addEventListener("change", changeHandler);
        })
        .catch((error) => {
            handleError(error);
        });
}

/*
** BUILD LIST OF FONTS FOR "headings" OR "text" 
*/
const buildFontList = (context) => {
    const category = document.getElementById(context + "-font-category").value;

    const query = "?category=" + category + "&context=" + context;

    callAPI(endpoint,'GET', query)
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


/*
** USER SELECTS FONT CATEGORY OR FONT
*/
const changeHandler = (e) => {
    const name = e.target.getAttribute("id");
    const context = name.split("-")[0];

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
        callAPI(endpoint,'PUT', obj)
            .then((data) => {
                const font_family = e.target.options[e.target.selectedIndex].text;
                if (font_family!=="system-ui") {
                    for (const fontface of data.urls) {
                        const fontFile = new FontFace(font_family,fontface.src_url);
                        fontFile.style = fontface.font_style;
                        fontFile.weight = fontface.font_weight;
                        if (fontface.font_stretch) {
                            fontFile.stretch = fontface.font_stretch;
                        }
                        document.fonts.add(fontFile);
                        fontFile.load();
                    };
                    document.fonts.ready.then(()=>{
                        console.log(`Loaded ${font_family}`);
                    });
                }
                document.documentElement.style.setProperty('--font-family-' + context, font_family); 
                loader.style.opacity=0;
            })
            .catch((error) => {
                loader.style.opacity=0;
                handleError(error);
            });
    }
};