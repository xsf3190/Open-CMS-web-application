/*
**  ADD / CHANGE / DELETE PAGES
*/
import { output_dialog, dialog_header, dialog_article, dialog_footer, dropdown } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let nav_items, edit, errors;

const endpoint = "edit-pages/:ID/:PAGE";

export const init = () => {
    callAPI(endpoint,'GET')
        .then((data) => {
            dialog_header.replaceChildren();
            dialog_header.insertAdjacentHTML('afterbegin',data.header);
            dialog_article.replaceChildren();
            dialog_article.insertAdjacentHTML('afterbegin',data.article);
            dialog_footer.replaceChildren();
            dialog_footer.insertAdjacentHTML('afterbegin',data.footer);
            output_dialog.showModal();

            nav_items = dialog_article.querySelector("nav>ul");
            errors = dialog_article.querySelector(".errors");

            edit = dialog_article.querySelector("input[name='navigation_label']");
            edit.value = dialog_article.querySelector(".active>a").textContent;
            setCollectionType(dialog_article.querySelector(".active>a").dataset.collection);

            nav_items.addEventListener("click", (e) => {
                e.preventDefault();
                
                for(let li of nav_items.children){ //all children of nav 
                    li.classList.remove("active");
                }
                e.target.parentElement.classList.add("active");
                edit.value = e.target.textContent;
                setCollectionType(e.target.dataset.collection);
            })

        })
        .catch((error) => {
            handleError(error);
        });
}

const setCollectionType = (data) => {
    const collection = dialog_article.querySelectorAll("[name='collection_type']");
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

/*
** REFLECT CHANGES IMMEDIATELY IN NAV ELEMENTS
*/
dialog_article.addEventListener("input", (e) => {
    if (e.target.matches("[name='navigation_label']")) {
        errors.textContent = "";
        nav_items.querySelector(".active>a").textContent = e.target.value;
    }

    if (e.target.matches("[name='collection_type']")) {
        errors.textContent = "";
        nav_items.querySelector(".active>a").dataset.collection = e.target.value;
    }
})

/*
** BUTTON CLICK EVENT HANDLERS
*/
let tmp = 0;
const newLabel = "[NEW PAGE]";

dialog_article.addEventListener("click", async (e) => {
    if (e.target.matches(".add-page")) {
        const target = nav_items.querySelector(".active");

        const clone = target.cloneNode(true);
        const a = clone.querySelector("a");
        a.textContent = newLabel;
        a.dataset.id = tmp--;
        a.dataset.collection = "N/A";
        
        nav_items.insertBefore(clone, target.nextSibling);
        const edit = dialog_article.querySelector("input[name='navigation_label']");
        edit.value = newLabel;

        target.classList.remove("active");
        return;
    }

    if (e.target.matches(".delete-site")) {
        console.log("clicked delete-site");
        callAPI(endpoint,'DELETE',{})
            .then(() => {
                window.location.reload();
                return;
            })
            .catch((error) => {
                handleError(error);
            });
    }

    if (e.target.matches(".delete-page")) {
        if (nav_items.childElementCount === 1) {
            e.target.classList.add("delete-site");
            e.target.style.backgroundColor = "red";
            e.target.textContent = "Delete Site";
            return;
        }
        const target = nav_items.querySelector(".active");
        if (target.nextElementSibling) {
            target.nextElementSibling.classList.add("active");
        } else {
            target.previousElementSibling.classList.add("active");
        }
        const edit = dialog_article.querySelector("input[name='navigation_label']");
        edit.value = nav_items.querySelector(".active>a").textContent;
        target.remove();
        return;
    }

    if (e.target.matches(".deploy")) {
        const arr = [];
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
                if (data.deleted>0) {
                    window.history.replaceState({}, "", "index.html");
                }
            })
            .catch((error) => {
                handleError(error);
            });

        dropdown.querySelector("button.publish-website").click();
    }
})