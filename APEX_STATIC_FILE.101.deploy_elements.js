export const bodydata = document.body.dataset;

export const dropdown = document.querySelector("#menulist");
export const email = dropdown.querySelector(".email");
export const expires = dropdown.querySelector(".expires");
export const login_btn = dropdown.querySelector(".login-btn");
export const login_dialog = document.querySelector("dialog.login-email");
export const output_dialog = document.querySelector("dialog.output");
export const dialog_header = output_dialog.querySelector("header>:first-child");
export const dialog_article = output_dialog.querySelector("article");
export const dialog_footer = output_dialog.querySelector("footer");

export const nav = document.querySelector(".topnav");
export const header = document.querySelector("body>header");
export const main = document.querySelector("body>main");
export const footer = document.querySelector("body>footer");

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
    dialog_header.replaceChildren();
    dialog_header.insertAdjacentHTML('afterbegin',data.header);
    dialog_article.replaceChildren();
    dialog_article.insertAdjacentHTML('afterbegin',data.article);
    dialog_footer.replaceChildren();
    dialog_footer.insertAdjacentHTML('afterbegin',data.footer);
    output_dialog.showModal();
}