/*
**  USER INFO MODULE - REVIEW LOGGED ON USER DETAILS, LOGOUT BUTTON HANDLER
*/
import { dialog_footer, initDialog, dropdown } from "deploy_elements";
import { callAPI } from "deploy_callAPI";

/*
**  CLICK HANDLER
*/
export const clickHandler = async (e) => {
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
    }
};

export const init = () => {
    callAPI("userinfo/:ID","GET")
        .then((data) => {
            initDialog(data);
        })
}