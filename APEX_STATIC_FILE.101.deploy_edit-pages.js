/*
**  ADD / CHANGE / DELETE PAGES
*/
import { dialog_article, dialog_footer, initDialog, dropdown } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let endpoint, pages, collection, navigation_label, isSending;

export const init = (e) => {
    endpoint = e.dataset.endpoint;

    callAPI(endpoint,'GET')
        .then((data) => {
            initDialog(data);
            pages = dialog_article.querySelector("fieldset.pages");
            navigation_label = dialog_article.querySelector("input[name='navigation-label']");
            collection = dialog_article.querySelectorAll("[name='collection_type']");
            isSending = false;
        })
        .catch((error) => {
            handleError(error);
        });
}

/*
** INPUT HANDLER - IGNORE
*/
export const inputHandler = (e) => {
    if (e.target.matches("[name='navigation-label']")) {
        pages.querySelector("[name='page']:checked + label").textContent = e.target.value;
    }
}

/*
**  CHANGE HANDLER
*/
export const changeHandler = (e) => {
    if (e.target.matches("[name='page']")) {
        console.log(e.target);
        navigation_label.value = e.target.nextSibling.textContent;
    }
    if (e.target.matches("[name='collection_type']")) {
        pages.querySelector("[name='page']:checked").dataset.collection = e.target.value;
    }
}

const setCollectionType = (data) => {
    switch (data) {
        case "N/A":
            collection[0].checked = true;
            break;
        case "BLOG":
            collection[1].checked = true;
            break;
        case "PORTFOLIO":
            collection[2].checked = true;
            break;
    }
}

const unsetCollection = () => {
    for( let i = 0; i < collection.length; i++ ) {
        collection[i].checked = false;
    }
}

/*
** BUTTON CLICK EVENT HANDLERS
*/
let tmp = 0;

export const clickHandler = async (e) => {
    if (e.target.matches(".add-page")) {
        tmp--;
        const id = `page-${tmp}`;
        const selected = pages.querySelector("[name='page']:checked").parentNode;
        const clone = selected.cloneNode(true);
        const label = clone.querySelector("label");
        label.textContent = "New Page";
        label.style.color = "red";
        label.setAttribute("for",id);
        const input = clone.querySelector("input");
        input.setAttribute("id",id);
        input.dataset.collection = "N/A";
        pages.insertBefore(clone, selected.nextSibling);
        setCollectionType("N/A");
        return;
    }

    if (e.target.matches(".delete-page")) {
        /* Valid Website has at least one page */
        if (pages.childElementCount === 1) {
            return;
        }
        pages.querySelector("[name='page']:checked").parentNode.remove();
        unsetCollection();
        navigation_label.value = "";
        
        return;
    }

    if (e.target.matches(".save")) {
        /* SAVE CHANGES AND PROMPT USER TO PUBLISH */
        const arr = [];
        pages.querySelectorAll("input").forEach ((item) => {
            const obj = {};
            obj.article_id = item.getAttribute("id");
            obj.collection_type = item.dataset.collection;
            obj.navigation_label = item.nextSibling.textContent;
            arr.push(obj);
        });

        if (isSending) {
            console.log("Prevent double sends");
            return;
        }
        const live=dialog_footer.querySelector("[aria-live]");
        const loader = dialog_footer.querySelector(".loader");
        
        isSending = true;
        live.textContent = e.target.dataset.processing;
        loader.style.opacity=1;

        await callAPI(endpoint,'POST', arr)
            .then((data) => {
                isSending = false;
                loader.style.opacity=0;        
                live.replaceChildren();
                live.textContent = data.message;
                if (data.published) {
                    setTimeout(() => {
                        window.location.replace(window.location.origin);
                    }, 1500);
                }
            })
            .catch((error) => {
                handleError(error);
            });
    }
}