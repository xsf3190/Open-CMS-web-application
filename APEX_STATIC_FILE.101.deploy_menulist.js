import { getJWTClaim } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

const form = document.querySelector("dialog.output form");

let isSending = false;

const eventHandler = async (e) => {
    /* Common controls */
    if (e.target.classList.contains("reload")) {
        window.location.reload();
        return;
    }
    
    if (e.target.classList.contains("close")) {
        e.target.closest("dialog").close();
        return;
    }

    if (e.target.classList.contains("publish")) {
        if (isSending) {
            console.log("Prevent double sends");
            return;
        }
        const live=form.querySelector("[aria-live]");
        const loader = form.querySelector(".loader");

        isSending = true;
        live.textContent = e.target.dataset.processing;
        loader.style.opacity=1;

        callAPI("publish-website/:ID", "POST", {})
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
        return;
    }

    /* Function specific - module name is data property of dialog form */
    const module = await import(e.currentTarget.dataset.module)
    .catch((error) => {
        console.error(error);
        console.error("Failed to load " + e.currentTarget.dataset.module);
        return;
    });
    if (e.type==="click") {
        module.clickHandler(e);
    } else if (e.type==="input") {
        module.inputHandler(e);
    } else if (e.type==="change") {
        module.changeHandler(e);
    }
}

/* Event handlers on common dialog */
form.addEventListener("input",eventHandler);
form.addEventListener("click",eventHandler);
form.addEventListener("change",eventHandler);

async function load_modules() { 
    let module_name = "deploy_edited-content";
    const module = await import(module_name)
    .catch((error) => {
        console.error(error);
        console.error("Failed to load " + module_name);
        return;
    });
    module.init();

    module_name = "deploy_fonts";
    const fonts = await import(module_name)
    .catch((error) => {
        console.error(error);
        console.error("Failed to load " + module_name);
        return;
    });
    const contexts = ["headings","text","logo","code"];
    contexts.forEach((context) => {
        if (localStorage.getItem(`${context}-font-urls`)) {
            fonts.loadFont(JSON.parse(localStorage.getItem(`${context}-font-urls`)),context);
        }
        if (localStorage.getItem(`${context}-font-properties`)) {
            fonts.setProperties(JSON.parse(localStorage.getItem(`${context}-font-properties`)),context);
        }
    })
}

const role = getJWTClaim("aud");
if (role==="owner" || role==="admin") {
    load_modules();
}

/*
 * DROPDOWN MENU ACTIONS
 * Applies keyboard interaction as described in https://www.w3.org/WAI/ARIA/apg/patterns/menubar/.
 * Also ensures that menu is closed when a menu option is activated (on click or enter).
 */

class MenuNavigationHandler {
  constructor(menuEl) {
    this.menuEl = menuEl;
    this.menuBtn = document.getElementById(this.menuEl.getAttribute("aria-labelledby"));    

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
    let module_name = event.target.dataset.endpoint;
    if (!module_name) return;

    module_name = "deploy_" + module_name.substring(0,module_name.indexOf("/"));
    const module = await import(module_name)
    .catch((error) => {
        console.error(error);
        console.error("Failed to load " + module_name);
        return;
    });
    form.dataset.module = module_name;
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