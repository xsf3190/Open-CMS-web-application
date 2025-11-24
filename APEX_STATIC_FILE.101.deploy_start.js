document.addEventListener('DOMContentLoaded',()=>{
    document.body.dataset.jslib = "#JSLIB#";
    document.body.dataset.resturl = "#RESTURL#";
    const script = document.createElement('script');
    script.src = document.body.dataset.jslib + "javascript/deploy_main.min.js";
    script.type = "module";
    document.body.appendChild(script);
})