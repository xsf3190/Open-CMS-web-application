/*
**  USER INFO MODULE - REVIEW LOGGED ON USER DETAILS, LOGOUT BUTTON HANDLER
*/
import { dialog_footer, initDialog, dropdown } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

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
            .catch((error) => {
                handleError(error);
            });
    }
    if (e.target.classList.contains("download")) {
        downloadWebsite();
    }
};

/*
**  DOWNLOAD WEBSITE TO USER'S DOWNLOAD FOLDER
*/
let isSending = false;

const downloadWebsite = () => {
    if (isSending) {
        console.log("Prevent double sends");
        return;
    }
    const live=dialog_footer.querySelector("[aria-live]");
    const loader = dialog_footer.querySelector(".loader");

    isSending = true;
    live.textContent = "Downloading website ... wait a few seconds";
    loader.style.opacity=1;

    callAPI("download-website/:ID","GET")
        .then((data) => {
            isSending = false;
            loader.style.opacity=0;        
            live.replaceChildren();
            live.insertAdjacentHTML('beforeend',data.message);
        })
        .catch((error) => {
            handleError(error);
        });
}

export const init = () => {
    callAPI("userinfo/:ID","GET")
        .then((data) => {
            initDialog(data);
        })
        .catch((error) => {
            handleError(error);
        });
}