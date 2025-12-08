/*
**  ADD / CHANGE / DELETE PAGES
*/
import { dialog_article, initDialog, dropdown } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let nav_items, edit, collection, errors;

const endpoint = "edit-pages/:ID/:PAGE";

/*
** USER CLICKS NAVIGATION LABEL IN EDITOR MAKING IT "current"
*/
const navHandler = (e) => {
    e.preventDefault();
                
    for(let li of nav_items.children){
        li.querySelector("[aria-current='page']")?.removeAttribute("aria-current");
    }
    e.target.setAttribute("aria-current","page");
    edit.value = e.target.textContent;
    setCollectionType(e.target.dataset.collection);
}

/*
** USER CHANGES NAVIGATION LABEL OR PAGE COLLECTTION TYPE
*/
const inputHandler = (e) => {
    if (e.target.matches("[name='navigation_label']")) {
        errors.textContent = "";
        nav_items.querySelector("[aria-current='page']").textContent = e.target.value;
    }

    if (e.target.matches("[name='collection_type']")) {
        errors.textContent = "";
        nav_items.querySelector("[aria-current='page']").dataset.collection = e.target.value;
    }
}

export const init = () => {
    callAPI(endpoint,'GET')
        .then((data) => {
            initDialog(data);

            nav_items = dialog_article.querySelector("ul");
            errors = dialog_article.querySelector(".errors");

            edit = dialog_article.querySelector("input[name='navigation_label']");
            edit.value = nav_items.querySelector("[aria-current='page']").textContent;

            collection = dialog_article.querySelectorAll("[name='collection_type']");
            setCollectionType(dialog_article.querySelector("[aria-current='page']").dataset.collection);

            nav_items.addEventListener("click", navHandler);
            dialog_article.addEventListener("input", inputHandler);
            dialog_article.addEventListener("click", buttonHandler);

        })
        .catch((error) => {
            handleError(error);
        });
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

const buttonHandler = async (e) => {
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

    if (e.target.matches(".delete-site")) {
        console.log("User wants to delete site!!");
        return;
        /*
        callAPI(endpoint,'DELETE',{})
            .then(() => {
                window.location.reload();
                return;
            })
            .catch((error) => {
                handleError(error);
            });
        */
    }

    if (e.target.matches(".delete-page")) {
        if (nav_items.childElementCount === 1) {
            e.target.classList.add("delete-site");
            e.target.style.backgroundColor = "red";
            e.target.textContent = "Delete Site";
            return;
        }
        nav_items.querySelector("[aria-current='page']").parentElement.remove();
        edit.value = "";
        unsetCollection();
        
        return;
    }

    if (e.target.matches(".deploy")) {
        const arr = [];
        errors.textContent = "";
        nav_items.querySelectorAll("a").forEach ((item) => {
            const obj = {};
            obj.article_id = item.dataset.id;
            obj.collection_type = item.dataset.collection;
            if (item.textContent === '' || item.textContent===newLabel) {
                errors.textContent += "Navigation Labels not complete";
            }
            obj.navigation_label = item.textContent;
            arr.push(obj);
        })
        if (errors.textContent) {
            return;
        }

        await callAPI(endpoint,'POST', arr)
            .then((data) => {
                console.log("data",data);
                if (data.deploy) {
                    dropdown.querySelector("[data-endpoint^=publish-website]").click();
                }
            })
            .catch((error) => {
                handleError(error);
            });
    }
}