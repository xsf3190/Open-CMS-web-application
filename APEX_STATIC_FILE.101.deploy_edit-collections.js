/*
**  ADD / CHANGE / DELETE PAGES
*/
import { dialog_article, dialog_footer, initDialog, liveRegion } from "deploy_elements";
import { callAPI } from "deploy_callAPI";

let endpoint, select, collectionitemdata;

export const init = (e) => {
    endpoint = e.dataset.endpoint;

    callAPI(endpoint,'GET')
        .then((data) => {
            initDialog(data);
            select = document.getElementById("collection-list");
            collectionitemdata = document.getElementById("collectionitemdata");
        })
}

/*
** INPUT HANDLER - WRITE USER'S INPUT INTO RADIO CONTROL NAVIGATION LABEL
*/
export const inputHandler = (e) => {
    if (e.target.getAttribute("aria-invalid")) {
        e.target.setAttribute("aria-invalid", "false");
    }
}

/*
**  CHANGE HANDLER
*/
export const changeHandler = (e) => {
    if (e.target.matches("[name='page']")) {
        console.log("changeHandler",e.target);
    }
    // User select new collection item
    if (e.target.matches("#collection-list")) {
        const collection_item = e.target.options[e.target.selectedIndex]?.getAttribute("value");
        callAPI(endpoint,'GET',"?collection_item="+collection_item)
        .then((data) => {
            collectionitemdata.replaceChildren();
            collectionitemdata.insertAdjacentHTML('afterbegin',data.item);
            dialog_footer.querySelector(".upd-item").dataset.collectionItem = collection_item;
        });
    }
}

/*
** BUTTON CLICK EVENT HANDLERS
*/
export const clickHandler = async (e) => {

    if (e.target.matches(".add-item")) {
        const title = document.getElementById("title");
        const obj = {
            action: "insert",
            parent_id: e.target.dataset.parentId,
            title: title.value,
            excerpt: document.getElementById("excerpt").value
        };
        callAPI(endpoint,'POST',obj)
        .then((data) => {
            // new_id is set when item successfully added
            if (data.new_id) {
                // Add new title to select list
                
                const option = document.createElement("option");
                option.value = data.new_id;
                option.text = obj["title"];
                select.add(option,select.options[0]);
                select.querySelector("selectedcontent").textContent = obj["title"];
                collectionitemdata.replaceChildren();
                collectionitemdata.insertAdjacentHTML('afterbegin',data.item);
                dialog_footer.querySelector(".upd-item").dataset.collectionItem = collection_item;
            } else {
                // otherwise signal error
                title.setAttribute("aria-invalid", "true");
                title.nextSibling.textContent = data.message;
            }
            liveRegion(data);
        });
    }

    if (e.target.matches(".upd-item")) {
        const checked = dialog_article.querySelectorAll("[name='link']:checked");

        const obj = {
            action: "update",
            collection_item: e.target.dataset.collectionItem,
            excerpt: document.getElementById("excerpt-upd").value,
            links: Array.from(checked).map(x => x.value)
        };
        callAPI(endpoint,'POST',obj)
        .then((data) => {
            liveRegion(data);
        });
    }

    if (e.target.matches(".del-item")) {
        const collectionItem = e.target.dataset.collectionItem;
        const obj = {
            action: "delete",
            collection_item: collectionItem
        };
        callAPI(endpoint,'POST',obj)
        .then((data) => {
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].value === collectionItem) {
                    select.remove(i);
                }
            }
            document.getElementById("excerpt-upd").value = "";
            dialog_article.querySelectorAll("[name='link']:checked").forEach(item => {
                item.checked = false;
            });
            const del_btn = dialog_article.querySelector(".del-item");
            del_btn.dataset.collectionItem = 0;
            del_btn.previousSibling.textContent = "";
            dialog_footer.querySelector(".upd-item").dataset.collectionItem = 0;
            liveRegion(data);
            select.focus();
        });
    }
}