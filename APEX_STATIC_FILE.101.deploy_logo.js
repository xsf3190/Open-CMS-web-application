/*
**  WEBSITE LOGO
*/
import { dialog_article, dialog_footer, initDialog } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let endpoint;

const logo = document.querySelector(".logo");

/*
**  CLICK PUBLISH BUTTON
*/
let isSending = false;

const footerHandler = async (e) => {
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

const removeSelectedImg = () => {
    dialog_article.querySelector("#logo-img [selected]")?.removeAttribute("selected");
}

const logo_img = (e) => {
    const selected = e.options[e.selectedIndex].querySelector("img");
    let img = logo.querySelector("img");
    if (!img) {
        img = document.createElement("img");
        img.setAttribute("alt","");
        logo.appendChild(img);
    }
    img.src = selected.src;

    callAPI(endpoint,"PUT",{logo_type:"img",asset_id:e.options[e.selectedIndex].value})
        .then((data) => {
            const live=dialog_footer.querySelector("[aria-live]");
            live.replaceChildren();
            live.insertAdjacentHTML('beforeend',data.message);
        })
        .catch((error) => {
            handleError(error);
        });
}

const logo_font = (e) => {
    removeSelectedImg();
    callAPI(endpoint,"PUT",{logo_type:"font",font_id:e.options[e.selectedIndex].value})
        .then((data) => {
            const live=dialog_footer.querySelector("[aria-live]");
            live.replaceChildren();
            live.insertAdjacentHTML('beforeend',data.message);
        })
        .catch((error) => {
            handleError(error);
        });
}

const logo_text = (e) => {
    removeSelectedImg();
    callAPI(endpoint,"PUT",{logo_type:"font",font_text:e.value})
        .then((data) => {
            logo.textContent = e.value;
            const live=dialog_footer.querySelector("[aria-live]");
            live.replaceChildren();
            live.insertAdjacentHTML('beforeend',data.message);
        })
        .catch((error) => {
            handleError(error);
        });
}

const changeHandler = (e) => {
    console.log("changeHandler")
    const id = e.target.getAttribute("id");
    console.log("id",id)
    logo.replaceChildren();

    if (id === "logo-img") {
        logo_img(e.target);
    } 
    else if (id === "logo-text") {
        logo_text(e.target);
    }
    else if (id === "logo-font-id") {
        logo_font(e.target);
    }
}

export const init = (element) => {
    endpoint = element.dataset.endpoint;
    callAPI(endpoint,"GET")
        .then((data) => {
            initDialog(data);
            dialog_footer.addEventListener("click", footerHandler);
            dialog_article.addEventListener("change", changeHandler);
        })
        .catch((error) => {
            handleError(error);
        });
}