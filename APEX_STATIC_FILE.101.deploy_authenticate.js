/* ************************************************************** */
/* LOGIN HANDLER - AUTHENTICATION BY EMAIL USING LINK OR PASSCODE */
/* ************************************************************** */

import { dropdown, output_dialog, dialog_footer, initDialog } from "deploy_elements";
import { callAPI, handleError, replaceTokens } from "deploy_callAPI";

const form = output_dialog.querySelector("form");

let endpoint, summary, intervalId, live, loader, userid;

export const init = (element) => {
    endpoint = element.dataset.endpoint;
    callAPI(endpoint, "GET")
        .then((data) => {
            initDialog(data);
            live = dialog_footer.querySelector("[aria-live]");
            loader = dialog_footer.querySelector(".loader");
            summary = document.getElementById("error-summary");
        })
        .catch((error) => {
                handleError(error);
        });
}

/*
**  USER CLICKS "Send Link" OR "Send Code"
*/
let isSending = false;

export const clickHandler = (e) => {

    if (!e.target.classList.contains("sendmail-magic") && 
        !e.target.classList.contains("sendmail-passcode") &&
        !e.target.classList.contains("validate-passcode")) {
        return;
    }
    console.log("start form validation")

    const errors = [];
        
    /* Email is required */
    const email = document.getElementById("email");

    /* Reset inline errors */
    [email].forEach((field) => {
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-describedby");
        document.getElementById(`${field.id}-error`).innerHTML = "";
    });

    /* Validate email */
    if (!email.value.trim()) {
        errors.push({
            field: email,                    // Reference to the input field itself
            message: "Enter email address",  // The specific error message to display
            errorId: "email-error"           // The ID of the inline error container
        });
    }

    showErrors(errors);

    if (errors.length > 0) return;

    if (isSending) {
        console.log("Prevent double sends");
        return;
    }
    isSending = true;

    let request_type;
    if (e.target.classList.contains("sendmail-magic")) {
        request_type = "magic";
    } else if (e.target.classList.contains("sendmail-passcode")) {
        request_type = "passcode";
    } else if (e.target.classList.contains("validate-passcode")) {
        request_type = "verify";
    }
    console.log("request_type",request_type);

    live.textContent = e.target.dataset.processing;
    loader.style.opacity=1;

    if (request_type!=="verify") {
        form.querySelector("[name='url']").value = window.location.hostname;
        form.querySelector("[name='request_type']").value = request_type;
        const formData = new FormData(form);
        const formObj = Object.fromEntries(formData);
        callAPI(endpoint, "POST", formObj)
            .then((data) => {
                isSending = false;
                userid=data.userid;
                loader.style.opacity=0;        
                live.replaceChildren();
                live.insertAdjacentHTML('beforeend',data.message);
                live.style.color = "red";
                if (request_type==="magic") {
                    clearInterval(intervalId);
                    intervalId = setInterval(checkAuthStatus,3000, formObj);
                } else if (request_type==="passcode") {
                    document.getElementById("passcode").removeAttribute("disabled");
                }
            })
            .catch((error) => {
                loader.style.opacity=0;
                handleError(error);
            });
    } else if (request_type==="verify") {
        const query = "?request=passcode&user=" + userid + "&verify=" + document.getElementById("passcode").value
        callAPI("auth-verify/:ID", "GET", query)
            .then((data) => {
                isSending = false;
                loader.style.opacity=0;
                setTokens(data);
                live.textContent = "LOGGED ON SUCCESSFULLY";
                live.style.color = "green";
            })
            .catch((error) => {
                loader.style.opacity=0;
                handleError(error);
            });
    }
}

export const inputHandler = (e) => {
    console.log("inputHandler - do nothing");
}

export const changeHandler = (e) => {
    console.log("changeHandler - do nothing");
}

/* 
** USER LOGGED IN. SET NEW TOKENS IN STORAGE AND MEMORY. UPDATE DROPDOWN MENULIST.
*/
const setTokens = async (data) => {
    // localStorage.setItem("refresh",data.refresh);
    // sessionStorage.setItem("token",data.token);
    replaceTokens(data);

    localStorage.setItem("menulist",data.menulist);  
    dropdown.replaceChildren();
    dropdown.insertAdjacentHTML('afterbegin',data.menulist);
    
    // Initialize menu dropdown
    const menu = await import("deploy_menulist")
    .catch((error) => {
        console.error(error);
        console.error("Failed to load deploy_menulist");
        return;
    });
    new menu.MenuNavigationHandler(dropdown);
}

/* 
** WAIT FOR USER TO CLICK MAGIC LINK SENT TO THEIR INBOX
*/
const checkAuthStatus = (formObj) => {
    callAPI(endpoint, "PUT", formObj)
        .then((data) => {
            if (data.token) {
              setTokens(data);
              live.textContent = "LOGGED ON SUCCESSFULLY";
              live.style.color = "green";
              clearInterval(intervalId);
            } else if (data.expired) {
              live.textContent = "Expired";
              live.style.color = "red";
              clearInterval(intervalId);
            }
        })
        .catch((error) => {
            live.textContent = error;
            live.style.color = "red";
            clearInterval(intervalId);
        });
}

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