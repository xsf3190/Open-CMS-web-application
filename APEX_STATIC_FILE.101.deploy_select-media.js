/*
**  SELECT MEDIA COPIES ITS URL TO CLIPBOARD. USER PASTES URL TO INSERT IMAGE IN CONTENT
*/
import { dialog_article, initDialog } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

const selectHandler = async (e) => {
    /* click on <button class="copy"> */
    if (e.target.classList.contains("copy")) {
        dialog_article.querySelectorAll(".copied").forEach( (copied) => {
			copied.classList.toggle("copied");
		});
        e.target.closest("li").classList.toggle("copied");
        const img = e.target.querySelector("img");
        try {
            await navigator.clipboard.writeText(img.src);
        } catch (error) {
            handleError(error);
        }
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