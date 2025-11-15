/* COMMON ELEMENTS AND FUNCTIONS  USED IN APPLICATION */
export const bodydata = document.body.dataset;

export const dropdown = document.getElementById("menulist");
export const email = dropdown.querySelector(".email");
export const expires = dropdown.querySelector(".expires");
export const login_btn = dropdown.querySelector(".login-btn");
export const login_dialog = document.querySelector("dialog.login-email");
export const output_dialog = document.querySelector("dialog.output");
export const dialog_header = output_dialog.querySelector("header");
export const dialog_article = output_dialog.querySelector("article");
export const dialog_footer = output_dialog.querySelector("footer");

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
 * DROPDOWN MENU ACTIONS
 * Applies keyboard interaction as described in https://www.w3.org/WAI/ARIA/apg/patterns/menubar/.
 * Also ensures that menu is closed when a menu option is activated (on click or enter).
 */
class MenuNavigationHandler {
  constructor(menuEl) {
    this.menuEl = menuEl;
    this.menuBtn = document.getElementById(this.menuEl.getAttribute("aria-labelledby")
);
    this.menuItems = Array.from(menuEl.children);
    this.selectedItem = null;
    this.selectedItemIndex = 0;
    // Handle interaction with menu
    this.menuEl.addEventListener("toggle", (event) => this.onMenuOpen(event));
    this.menuEl.addEventListener("keydown", (event) => this.onMenuKeydown(event));
    this.menuEl.addEventListener("click", (event) => this.onMenuClick(event));
  }

  onMenuOpen(event) {
    if (event.newState === 'open') {
      // Select first item when menu is opened
      this.selectAndFocusMenuItem(0);
    } else {
      // Cleanup when menu is closed
      this.selectedItem.tabIndex = -1;
    }
  }

  onMenuKeydown(event) {
    if (event.key === 'ArrowDown') {
      this.selectNextMenuItem(event);
    } else if (event.key === 'ArrowUp') {
      this.selectPreviousMenuItem(event);
    } else if (event.key === 'Tab') {
      // On TAB or SHIFT+TAB, close panel after short delay.
      setTimeout(() => this.menuEl.hidePopover(), 50);
    }
  }
  
  onMenuClick = async (event) => {
    if (event.target.tagName==="A") return;
    
    let module_name = event.target.dataset.endpoint;
    if (!module_name) return;

    if (!document.querySelector("head > [type='importmap']")) {
        await importmap();
    }

    module_name = "deploy_" + module_name.substring(0,module_name.indexOf("/"));
    const module = await import(module_name)
    .catch((error) => {
        console.error(error);
        console.error("Failed to load " + module_name);
    });
    module.init(event.target);
  }

  selectNextMenuItem(event) {
    // Remove currently selected menu item from tab order
    this.selectedItem.tabIndex = -1;
    // Focus next menu item. If we're at the last item, then loop back to first.
    if (this.selectedItemIndex < this.menuItems.length - 1) {
      this.selectAndFocusMenuItem(this.selectedItemIndex + 1);
    } else {
      this.selectAndFocusMenuItem(0);
    }
    event.preventDefault();
  }

  selectPreviousMenuItem(event) {
    // Remove currently selected menu item from tab order
    this.selectedItem.tabIndex = -1;
    // Focus previous menu item. If we're at the first item, then loop back to last.
    if (this.selectedItemIndex > 0) {
      this.selectAndFocusMenuItem(this.selectedItemIndex - 1);
    } else {
      this.selectAndFocusMenuItem(this.menuItems.length - 1);
    }
    event.preventDefault();
  }

  selectAndFocusMenuItem(index) {
    this.selectedItemIndex = index;
    this.selectedItem = this.menuItems[index];
    this.selectedItem.focus();
  }
}

export { MenuNavigationHandler };