/* ************************** */
/* EDIT COLLECTION INDEX      */
/* ************************** */
import { callAPI, handleError } from "deploy_callAPI";
import { dialog_article, dialog_footer, initDialog } from "deploy_elements";

let endpoint;
let dml;

export const init = (element) => {
    endpoint = element.dataset.endpoint;
    
    callAPI(endpoint, "GET")
    .then((data) => {
        initDialog(data);
        dml = dialog_article.querySelector("[name=dml]")?.value;
    })
    .catch((error) => {
            handleError(error);
    });
}

const setLogo = (value) => {
    const logo = document.querySelector(".logo");
    logo.replaceChildren();
    if (value) {
        logo.insertAdjacentHTML("beforeend",value);
        const svg = logo.querySelector("svg");
        if (!svg) {
            handleError("NOT VALID SVG");
            return;
        }
        const viewBox = svg.getAttribute("viewBox")?.split(" ");
        if (!viewBox) {
            handleError("SVG MUST HAVE VIEWBOX");
            return;
        }
        const width = Number(viewBox[0]) + Number(viewBox[2]);
        const height = Number(viewBox[1]) + Number(viewBox[3]);

        logo.style.aspectRatio = width + "/" + height;
    }
}

/*
** DEFAULT FAVICON IS GREEN LEAF EMOJI
*/
const setFavicon = (value) => {
    const favicon = document.querySelector("head > link[rel='icon']");
    
    let replacedValue;
    if (value) {
        replacedValue = value.replaceAll('"','%22').replaceAll('#','%23');
    } else {
        replacedValue = "🌿";
    }

    /* Maximum length of emoji should be 5? */
    if (value.length<=5) {
        favicon.setAttribute("href", `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${replacedValue}</text></svg>`);
    } else {
        favicon.setAttribute("href", `data:image/svg+xml,${replacedValue}`);
    }
}

const setLogoWidth = (value) => {
    document.documentElement.style.setProperty('--logo-inline-size', value + "cqi"); 
}

const setImgBorderRadius = (value) => {
    document.documentElement.style.setProperty('--img-border-radius', value + "px"); 
}

const changeHandler = (e) => {
    if (dml==="insert") return;

    const name = e.target.getAttribute("name");

    if (name==="logo") {
        setLogo(e.target.value);
    }
    if (name==="logo-inline-size") {
        setLogoWidth(e.target.value);
    }
    if (name==="favicon") {
        setFavicon(e.target.value);
    }
    if (name==="img-border-radius") {
        setImgBorderRadius(e.target.value);
    }
    
    callAPI(endpoint, "PUT", {name:name, value:e.target.value})
    .then((data) => {
        console.log(data);
    })
    .catch((error) => {
            handleError(error);
    });
}

let isSending = false;

/*
**  CLICK PUBLISH OR DELETE BUTTON
*/
const clickHandler = (e) => {
    if (!e.target.classList.contains("publish") && !e.target.classList.contains("delete")) {
        return;
    }

    if (isSending) {
        console.log("Prevent double sends");
        return;
    }
    const live=dialog_footer.querySelector("[aria-live]");
    const loader = dialog_footer.querySelector(".loader");

    isSending = true;
    live.textContent = e.target.dataset.processing;
    loader.style.opacity=1;

    const formObj = {};
    let method;

    if (e.target.classList.contains("publish")) {
        formObj["dml"]=dml;
        formObj["title"]=dialog_article.querySelector("[name=title]")?.value;
        formObj["excerpt"]=dialog_article.querySelector("[name=excerpt]")?.value;
        method = "POST";
    } else {
        method="DELETE";
        e.target.remove();
    }

    callAPI(endpoint, method, formObj)
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
};

dialog_article.addEventListener("change", changeHandler);
dialog_footer.addEventListener("click", clickHandler);