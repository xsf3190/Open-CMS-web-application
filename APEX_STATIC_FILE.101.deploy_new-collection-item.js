/* ************************** */
/* CREATE NEW COLLECTION ITEM */
/* ************************** */
import { callAPI, handleError } from "deploy_callAPI";
import { dialog_article, dialog_footer, initDialog } from "deploy_elements";

let endpoint;
let summary;

export const init = (element) => {
    endpoint = element.dataset.endpoint;
    
    callAPI(endpoint, "GET","?parentid="+element.dataset.parentId)
    .then((data) => {
        initDialog(data);
        summary = document.getElementById("error-summary");
    })
    .catch((error) => {
            handleError(error);
    });
}

let isSending = false;

/*
**  CLICK PUBLISH BUTTON IN THE FOOTER
*/
const footerHandler = (e) => {
    if (!e.target.classList.contains("publish")) {
        return;
    }

    /* FORM VALIDATION */

    const errors = [];

    const title = document.getElementById("title");
    const excerpt = document.getElementById("excerpt");

    /* Reset inline errors */
    [title, excerpt].forEach((field) => {
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-describedby");
        document.getElementById(`${field.id}-error`).innerHTML = "";
    });

    /* Validate title */
    if (!title.value.trim()) {
        errors.push({
            field: title,               // Reference to the input field itself
            message: "Enter a title",   // The specific error message to display
            errorId: "title-error"      // The ID of the inline error container
        });
    }

    /* Validate excerpt */
    if (!excerpt.value.trim()) {
        errors.push({
            field: excerpt,
            message: "Enter an excerpt", 
            errorId: "excerpt-error"
        });
    }

    showErrors(errors);

    if (errors.length === 0) {

        if (isSending) {
            console.log("Prevent double sends");
            return;
        }
        const live=dialog_footer.querySelector("[aria-live]");
        const loader = dialog_footer.querySelector(".loader");

        isSending = true;
        live.textContent = e.target.dataset.processing;
        loader.style.opacity=1;

        const formObj = {};

        formObj["parentid"]=e.target.dataset.parentId;
        formObj["title"]=dialog_article.querySelector("[name=title]").value;
        formObj["excerpt"]=dialog_article.querySelector("[name=excerpt]").value;

        callAPI(endpoint, "POST", formObj)
            .then((data) => {
                isSending = false;
                loader.style.opacity=0;        
                live.replaceChildren();
                if (data.link) {
                    live.insertAdjacentHTML('beforeend',data.link);
                    live.style.color = "green";
                }
                if (data.message) {
                    live.insertAdjacentHTML('beforeend',data.message);
                    live.style.color = "red";
                }
            })
            .catch((error) => {
                loader.style.opacity=0;
                handleError(error);
            });
    }
};

const showErrors = (errors) => {
    const list = summary.querySelector("ul");
    list.innerHTML = "";

    if (errors.length > 0) {
        errors.forEach((err) => {
            // Inline error for each field
            err.field.setAttribute("aria-invalid", "true");
            err.field.setAttribute("aria-describedby", err.errorId);
            const inlineError = document.getElementById(err.errorId);

            // Clear old content
            inlineError.innerHTML = "";

            // Insert icon + message
            const icon = document.createElement("span");
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = "⚠️";
            icon.style.marginRight = "0.25rem";

            inlineError.appendChild(icon);
            inlineError.appendChild(document.createTextNode(err.message));

            // Add linked error message to summary list
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = `#${err.field.id}`;
            a.textContent = err.message;
            a.addEventListener("click", () => err.field.focus());
            li.appendChild(a);
            list.appendChild(li);
        });

        summary.hidden = false;
        summary.focus();
        summary.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
        summary.hidden = true;
    }
}

dialog_footer.addEventListener("click", footerHandler);