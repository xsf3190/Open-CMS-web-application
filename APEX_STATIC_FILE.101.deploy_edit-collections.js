/*
**  ADD / CHANGE / DELETE PAGES
*/
import { dialog_article, dialog_footer, initDialog, liveRegion } from "deploy_elements";
import { callAPI } from "deploy_callAPI";

let endpoint, select, collectionitem;

export const init = (e) => {
    endpoint = e.dataset.endpoint;

    callAPI(endpoint,'GET')
        .then((data) => {
            initDialog(data);
            select = document.getElementById("collection-items");
            collectionitem = document.getElementById("collection-item");
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
    if (e.target.matches("[name='collection']")) {
        const parent_id=e.target.dataset.parentId;
        callAPI(endpoint,'GET',"?collection="+parent_id)
        .then((data) => {
            const collection = document.getElementById("collection");
            collection.replaceChildren();
            collection.insertAdjacentHTML('afterbegin',data.collection);
        });
    }

    // User selects collection item
    if (e.target.matches("#collection-items")) {
        const item = e.target.options[e.target.selectedIndex].getAttribute("value");
        if (item) {
            callAPI(endpoint,'GET',"?collection="+e.target.dataset.collection+"&item="+item)
            .then((data) => {
                collectionitem.replaceChildren();
                collectionitem.insertAdjacentHTML('afterbegin',data.item);
                dialog_footer.querySelector(".upd-item").dataset.collectionItem = item;
            });
        }
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
                select.options[0].textContent = data.count;
                const option = document.createElement("option");
                option.value = data.new_id;
                option.text = obj["title"];
                select.add(option,select.options[1]);
                select.querySelector("selectedcontent").textContent = obj["title"];
                collectionitem.replaceChildren();
                collectionitem.insertAdjacentHTML('afterbegin',data.item);
                dialog_footer.querySelector(".upd-item").dataset.collectionItem = data.new_id;
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
        const item = e.target.dataset.collectionItem;
        const obj = {
            action: "delete",
            collection_item: item
        };
        callAPI(endpoint,'POST',obj)
        .then((data) => {
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].value === item) {
                    select.remove(i);
                }
            }
            select.options[0].textContent = data.count;
            liveRegion(data);
            collectionitem.replaceChildren();
            select.focus();
        });
    }
}