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