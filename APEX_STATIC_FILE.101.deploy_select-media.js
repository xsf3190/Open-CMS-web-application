/*
**  SELECT MEDIA COPIES ITS URL TO CLIPBOARD. USER PASTES URL TO INSERT IMAGE IN CONTENT
*/
import { initDialog, dialog_footer } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

export const clickHandler = async (e) => {
    const live=dialog_footer.querySelector("[aria-live]");
    if (e.target.classList.contains("copy")) {
        try {
            await navigator.clipboard.writeText(e.target.dataset.url);
            live.textContent = e.target.dataset.file + " copied to clipboard";
        } catch (error) {
            handleError(error);
        }
    }
    if (e.target.classList.contains("delete")) {
        callAPI("upload-media/:ID/:PAGE","DELETE",{id:e.target.dataset.id})
            .then(() => {
                e.target.closest("tr").remove();
                live.textContent = e.target.dataset.file + " deleted";
            })
            .catch((error) => {
                handleError(error);
            });
    }
};

export const init = () => {
    callAPI("upload-media/:ID/:PAGE","GET","?request=image")
        .then((data) => {
            initDialog(data);
        })
        .catch((error) => {
            handleError(error);
        });
}