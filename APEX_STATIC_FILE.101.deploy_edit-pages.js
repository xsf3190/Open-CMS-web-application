/*
**  ADD / CHANGE / DELETE PAGES
*/
import { dialog_article, initDialog, dropdown } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let endpoint, nav_items, edit, collection;

export const init = (e) => {
    endpoint = e.dataset.endpoint;

    callAPI(endpoint,'GET')
        .then((data) => {
            console.log(data);
            initDialog(data);

            nav_items = dialog_article.querySelector("fieldset:has([name='nav'])");

            edit = dialog_article.querySelector("input[name='navigation_label']");
            edit.value = nav_items.querySelector("input:checked ~ label").textContent;

            collection = dialog_article.querySelectorAll("[name='collection_type']");
            setCollectionType(dialog_article.querySelector("[aria-current='page']").dataset.collection);
        })
        .catch((error) => {
            handleError(error);
        });
}

/*
** USER CHANGES NAVIGATION LABEL OR PAGE COLLECTION TYPE
*/
export const inputHandler = (e) => {
    if (e.target.matches("[name='navigation_label']")) {
        nav_items.querySelector("[aria-current='page']").textContent = e.target.value;
    }

    if (e.target.matches("[name='collection_type']")) {
        nav_items.querySelector("[aria-current='page']").dataset.collection = e.target.value;
    }
}

/*
**  IGNORE CHANGE EVENTS
*/
export const changeHandler = (e) => {
    console.log("e",e);
    if (e.target.tagName==="A") {
        e.target.preventDefault();
                    
        for(let li of nav_items.children){
            li.querySelector("[aria-current='page']")?.removeAttribute("aria-current");
        }
        e.target.setAttribute("aria-current","page");
        edit.value = e.target.textContent;
        setCollectionType(e.target.dataset.collection);
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
const newLabel = "[NEW PAGE]";

export const clickHandler = async (e) => {
    if (e.target.matches(".add-page")) {
        const target = nav_items.querySelector("[aria-current='page']").parentElement;

        const clone = target.cloneNode(true);
        const a = clone.querySelector("a");
        a.textContent = newLabel;
        a.dataset.id = tmp--;
        a.dataset.collection = "N/A";
        
        nav_items.insertBefore(clone, target.nextSibling);
        edit.value = newLabel;
        setCollectionType("N/A");

        target.firstElementChild.removeAttribute("aria-current");
        return;
    }

    if (e.target.matches(".delete-page")) {
        /* Valid Website has at least one page */
        if (nav_items.childElementCount === 1) {
            return;
        }
        nav_items.querySelector("[aria-current='page']").parentElement.remove();
        edit.value = "";
        unsetCollection();
        
        return;
    }

    if (e.target.matches(".save")) {
        /* SAVE CHANGES AND PROMPT USER TO PUBLISH */
        const arr = [];
        nav_items.querySelectorAll("a").forEach ((item) => {
            const obj = {};
            obj.article_id = item.dataset.id;
            obj.collection_type = item.dataset.collection;
            obj.navigation_label = item.textContent;
            arr.push(obj);
        })

        await callAPI(endpoint,'POST', arr)
            .then((data) => {
                dropdown.querySelector("[data-endpoint^=publish-website]").click();
            })
            .catch((error) => {
                handleError(error);
            });
    }
}