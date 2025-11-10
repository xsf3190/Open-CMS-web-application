/*
**  SELECT MEDIA COPIES ITS URL TO CLIPBOARD. USER PASTES URL TO INSERT IMAGE IN CONTENT
*/
import { dialog_article, dialog_footer, initDialog } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

const selectHandler = async (e) => {
    /* click on <button class="copy"> */
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
                live.textContent = e.target.dataset.file + " is permanently deleted";
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
            dialog_article.addEventListener("click", selectHandler);
        })
        .catch((error) => {
            handleError(error);
        });
}