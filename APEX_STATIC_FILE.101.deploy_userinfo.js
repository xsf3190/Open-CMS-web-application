/*
**  USER INFO MODULE - REVIEW LOGGED ON USER DETAILS, LOGOUT BUTTON HANDLER
*/
import { dialog_article, dialog_footer, initDialog, dropdown } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

/*
**  CLICK DELETE WEBSITE BUTTON IN THE ARTICLE
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
const actionHandler = (e) => {
    if (!e.target.classList.contains("delete")) {
        return;
    }
    console.log("Delete", e.target);
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