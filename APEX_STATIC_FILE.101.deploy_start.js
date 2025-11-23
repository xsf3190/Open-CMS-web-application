document.addEventListener('DOMContentLoaded',()=>{
    const script = document.createElement('script');
    script.src = document.body.dataset.jslib + "javascript/deploy_main.min.js";
    script.type = "module";
    document.body.appendChild(script);
})