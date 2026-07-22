import { getJWTClaim, initDialog, output_dialog, form } from "deploy_elements";
import { callAPI } from "deploy_callAPI";

const eventHandler = async (e) => {
    /* "publish" button occurs in multiple forms */

    if (e.target.classList.contains("close")) {
        e.target.closest("dialog").close();
        return;
    }

    if (e.target.classList.contains("publish")) {
        callAPI("publish-website/:ID")
            .then((data) => {
                initDialog(data);
                form.dataset.module = "deploy_publish-website";
            })
        return;
    }

    if (e.type==="close") {
        console.log("DIALOG CLOSE EVENT FIRED");
        return;
    }

    /* 
    ** module is data attribute of the common dialog form to which
    ** the click, change and input events are attached.
    ** Dialog content is replaced when menu buttons are clicked.
    ** Form events bubble up to the attached handlers which load
    ** the module and invoke its event handler - means that individual modules
    ** must export its "clickHandler" function to be invoked here.
    */
    
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

output_dialog.addEventListener("close",eventHandler);
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