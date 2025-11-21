/*
**  USER INFO MODULE - REVIEW LOGGED ON USER DETAILS, LOGOUT BUTTON HANDLER
*/
import { dialog_article, dialog_footer, initDialog, dropdown } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

const selectHandler = async (e) => {
    /* click on <button class="logout"> */
    const live=dialog_footer.querySelector("[aria-live]");
    if (e.target.classList.contains("logout")) {
        callAPI("userinfo/:ID","DELETE",{action:"logout"})
            .then((data) => {
                live.textContent = "Logged out";
                sessionStorage.clear();
                localStorage.clear();
                dropdown.replaceChildren();
                dropdown.insertAdjacentHTML('afterbegin',data.dropdown);
            })
            .catch((error) => {
                handleError(error);
            });
    }
};

export const init = () => {
    callAPI("userinfo/:ID","GET")
        .then((data) => {
            initDialog(data);
            dialog_footer.addEventListener("click", selectHandler);
        })
        .catch((error) => {
            handleError(error);
        });
}