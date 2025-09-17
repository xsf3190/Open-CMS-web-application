/*
**  ADD / CHANGE / DELETE PAGES
*/
import { output_dialog, dialog_header, dialog_article, dialog_footer } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let nav_items;

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

            const edit = dialog_article.querySelector("input[name='navigation_label']");
            const current = nav_items.querySelector("[aria-current='page']")
            edit.value = current.textContent;
            setCollectionType(current.dataset.collection);
            nav_items.querySelector(".visually-hidden")?.classList.remove("visually-hidden");

            nav_items.addEventListener("click", (e) => {
                e.preventDefault();
                removeAriaCurrent();
                e.target.setAttribute("aria-current","page");
                const edit = dialog_article.querySelector("input[name='navigation_label']");
                edit.value = e.target.textContent;
                setCollectionType(e.target.dataset.collection);
            })

        })
        .catch((error) => {
            handleError(error);
        });
}

let tmp = 0;

const removeAriaCurrent = () => {
  nav_items.querySelectorAll("a").forEach( (a) => {
    a.removeAttribute("aria-current");
  })
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
        nav_items.querySelector("[aria-current='page']").textContent = e.target.value;
    }

    if (e.target.matches("[name='collection_type']")) {
        nav_items.querySelector("[aria-current='page']").dataset.collection = e.target.value;
    }
})

/*
** BUTTON CLICK EVENT HANDLERS
*/
dialog_article.addEventListener("click", async (e) => {
    if (e.target.matches(".add-page")) {
        const target = nav_items.querySelector("[aria-current='page']").parentElement;  // returns <li>
        removeAriaCurrent();
        const clone = target.cloneNode(true);
        clone.firstChild.textContent = "[NEW PAGE]";
        clone.firstChild.dataset.id = tmp--;
        clone.firstChild.dataset.collection = "N/A";
        clone.firstChild.setAttribute("aria-current","page");
        
        nav_items.insertBefore(clone, target.nextSibling);
        const edit = dialog_article.querySelector("input[name='navigation_label']");
        edit.value = "[NEW PAGE]";
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
        const target = nav_items.querySelector("[aria-current='page']").parentElement;
        if (target.nextElementSibling) {
            target.nextElementSibling.firstChild.setAttribute("aria-current","page");
        } else {
            target.previousElementSibling.firstChild.setAttribute("aria-current","page");
        }
        const edit = dialog_article.querySelector("input[name='navigation_label']");
        edit.value = nav_items.querySelector("[aria-current='page']").textContent;
        target.remove();
        return;
    }
})