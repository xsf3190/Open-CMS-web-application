/*
**  USER INFO MODULE - REVIEW LOGGED ON USER DETAILS, LOGOUT BUTTON HANDLER
*/
import { dialog_article, dialog_footer, initDialog, dropdown } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

/*
**  CLICK LOGOUT BUTTON
*/
const footerHandler = async (e) => {
    /* click on <button class="logout"> */
    const live=dialog_footer.querySelector("[aria-live]");
    if (e.target.classList.contains("logout")) {
        callAPI("userinfo/:ID","DELETE",{action:"logout"})
            .then((data) => {
                live.textContent = "Logged out. Reloading page";
                sessionStorage.clear();
                localStorage.clear();
                dropdown.replaceChildren();
                dropdown.insertAdjacentHTML('afterbegin',data.dropdown);
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            })
            .catch((error) => {
                handleError(error);
            });
    }
};

/*
**  CLICK DELETE WEBSITE BUTTON IN THE ARTICLE
*/
let isSending = false;

const deleteWebsite = (websiteid, tablerow) => {
    if (isSending) {
        console.log("Prevent double sends");
        return;
    }
    const live=dialog_footer.querySelector("[aria-live]");
    const loader = dialog_footer.querySelector(".loader");

    isSending = true;
    live.textContent = "Deleting website";
    loader.style.opacity=1;

    callAPI("website/:ID","DELETE",{websiteid:websiteid})
        .then((data) => {
            isSending = false;
            loader.style.opacity=0;        
            live.replaceChildren();
            live.insertAdjacentHTML('beforeend',data.message);
            const tabindex = tablerow.closest("[tabindex]");
            tablerow.remove();
            tabindex.focus();
        })
        .catch((error) => {
            handleError(error);
        });
}

const actionHandler = (e) => {
    if (e.target.classList.contains("delete")) {
        deleteWebsite(e.target.dataset.websiteid, e.target.closest("tr"));
    }
}

export const init = () => {
    callAPI("userinfo/:ID","GET")
        .then((data) => {
            initDialog(data);
            dialog_footer.addEventListener("click", footerHandler);
            dialog_article.addEventListener("click", actionHandler);
        })
        .catch((error) => {
            handleError(error);
        });
}