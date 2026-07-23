/* COMMON ELEMENTS AND FUNCTIONS  USED IN APPLICATION */
export const bodydata = document.body.dataset;

export const dropdown = document.getElementById("menulist");
export const output_dialog = document.querySelector("dialog.output");
export const form = output_dialog.querySelector("form");
export const dialog_header = form.querySelector("header");
export const dialog_article = form.querySelector("article");
export const dialog_footer = form.querySelector("footer");

export const nav = document.querySelector(".topnav");
export const header = document.getElementById("header");
export const main = document.getElementById("main");
export const footer = document.getElementById("footer");

export const getJWTClaim = (claim) => {
    const arrayToken = localStorage.getItem("refresh")?.split(".");
    if (!arrayToken) return;
    const parsedToken = JSON.parse(atob(arrayToken[1]));
    let value;
    switch (claim) {
        case "sub":
            value = parsedToken.sub;
            break;
        case "aud":
            value = parsedToken.aud;
            break;
        case "exp":
            value = new Date(parsedToken.exp*1000).toLocaleString();
            break;
    }
    return value;
}

export const set_alert = (alert) => {
    alert.textContent = "SAVED";
    alert.style.background="green";
    setTimeout(() => {
        alert.textContent = "";
        alert.style.background="rebeccapurple";
    }, 1500);
}

/*
** APPLICATION USES SINGLE HTML DIALOG ELEMENT FOR CUSTOM EDITOR FUNCTIONS
*/
export const initDialog = (data) => {
    if (!data) return;
    
    let last = dialog_header.lastChild;

    while (true) {
        if (dialog_header.firstChild == last) break;
        dialog_header.removeChild(dialog_header.firstChild);
    }

    dialog_header.insertAdjacentHTML('afterbegin',data.header);

    dialog_article.replaceChildren();
    dialog_article.insertAdjacentHTML('afterbegin',data.article);

    dialog_footer.replaceChildren();
    dialog_footer.insertAdjacentHTML('afterbegin',data.footer);
    
    output_dialog.showModal();
}

/*
** COMMON ARIA LIVE REGION UPDATE FOR DIALOG FOOTER ELEMENT
*/
export const liveRegion = (data) => {
    const live=dialog_footer.querySelector("[aria-live]");
    live.replaceChildren();
    live.insertAdjacentHTML('beforeend',data.message);
}
