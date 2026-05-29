/*
**  ADD / CHANGE / DELETE PAGES
*/
import { dialog_article, initDialog, dropdown } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let endpoint, pages, collection;

export const init = (e) => {
    endpoint = e.dataset.endpoint;

    callAPI(endpoint,'GET')
        .then((data) => {
            initDialog(data);
            pages = dialog_article.querySelector("fieldset.pages");
            collection = dialog_article.querySelectorAll("[name='collection_type']");
        })
        .catch((error) => {
            handleError(error);
        });
}

/*
** INPUT HANDLER - IGNORE
*/
export const inputHandler = (e) => {
    console.log("DO NOTHING");
}

/*
**  CHANGE HANDLER
*/
export const changeHandler = (e) => {
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

        
        await callAPI(endpoint,'POST', arr)
            .then((data) => {
                if (data.message) {
                    document.querySelector("[aria-live]").textContent = data.message;
                } else {
                    dropdown.querySelector("[data-endpoint^=publish-website]").click();
                }
            })
            .catch((error) => {
                handleError(error);
            });
    }
}