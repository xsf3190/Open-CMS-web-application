/* 
** LIGHT DARK BUTTON HANDLERS
*/
class ColorScheme extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.setupControl("appearance", document.documentElement);
    }

    handleChange(e, prop, el) {
      const attr = `data-${prop}`;
      const value = e.target.value;

      if (!value) {
        localStorage.removeItem(prop);
        el.removeAttribute(attr);
        return;
      }

      localStorage.setItem(prop, value);
      el.setAttribute(attr, value);
    }
    
    setupControl(prop, el) {
      const initialValue = localStorage.getItem(prop) || "";
      const collection = this.querySelectorAll(`[name='${prop}']`);

      for (let item of collection) {
        item.checked = item.value === initialValue;
        item.addEventListener("change", (e) => this.handleChange(e, prop, el));
      }
    }
}

if ("customElements" in window) {
    window.customElements.define("color-scheme", ColorScheme);
}

document.addEventListener('DOMContentLoaded', async()=>{
    document.body.dataset.jslib = "#JSLIB#";
    document.body.dataset.resturl = "#RESTURL#";
    
    const importmap = document.body.dataset.jslib + "importmap.json";
    console.log("Create importmap " + importmap);
    const response = await fetch(importmap);
    const data = await response.json();
    const im = document.createElement('script');
    im.type = 'importmap';
    im.textContent = JSON.stringify(data);
    document.head.appendChild(im);

    const script = document.createElement('script');
    script.src = document.body.dataset.jslib + "javascript/deploy_main.min.js";
    script.type = "module";
    document.body.appendChild(script);
})