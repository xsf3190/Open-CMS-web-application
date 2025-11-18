export const metrics = [];

const bodydata = document.body.dataset;
const dropdown = document.querySelector("#menulist");
const dialog_close = document.querySelector("dialog.output .close");
const vitalsQueue = new Set();
const narrow_viewport = window.matchMedia("(width <= 600px)");

if (narrow_viewport.matches) {
    const nav = document.querySelector("nav");
    const ul = nav.querySelector("ul");
    if (ul.childElementCount>2) {
        menulist.prepend(nav);
        ul.style.flexDirection="column";
        ul.style.alignItems="start";
        ul.style.paddingBlockEnd="1rem";
    }
}

/* 
** TRACK PAGES VISITED IN SESSION 
*/
let pages_visited = JSON.parse(sessionStorage.getItem("pages_visited"));
const page_id = Number(document.body.dataset.articleid);
const pages_set = new Set(pages_visited);
pages_set.add(page_id);
sessionStorage.setItem("pages_visited",JSON.stringify(Array.from(pages_set)));

const closeHandler = (e) => {
    e.target.closest("dialog").close();
}

dialog_close.addEventListener("click", closeHandler);

/*
** GET DROPDOWN MENU FROM LOCALSTORAGE IF USER LOGGED IN
*/
let aud = "";
const jwt = localStorage.getItem("refresh");
if (jwt) {
    dropdown.replaceChildren();
    dropdown.insertAdjacentHTML('beforeend',localStorage.getItem("menulist"));
    const array = jwt.split(".");
    const parse = JSON.parse(atob(array[1]));
    aud = parse.aud;
    console.log("Refresh token exists. User is logged in as " + aud);
}

// Initialize menu dropdown
import { MenuNavigationHandler } from "/javascript/deploy_menulist.min.js";
new MenuNavigationHandler(dropdown);

/*
** INJECT IMPORTMAP IF USER SIGNALS INTENT TO EXECUTE ES MODULE
*/
const importmap = async () => {
    console.log("Create importmap for " + bodydata.importmap);

    const response = await fetch(bodydata.importmap);
    const data = await response.json();
    const im = document.createElement('script');
    im.type = 'importmap';
    im.textContent = JSON.stringify(data);
    document.head.appendChild(im);
}

/*
** SETUP COLLECTION OF METRICS. 
*/
let website_loaded = Number(sessionStorage.getItem("website_loaded"));
if (!website_loaded) {
    website_loaded = Math.round(Date.now()/1000);
    sessionStorage.setItem("website_loaded",website_loaded);
    console.log("sessionStorage.website_loaded",website_loaded);
}

let page_loaded = Date.now(),
    page_visit = 0;

const page_weight = () => {
  const total = metrics.reduce((accumulator,currentValue) => {
    return accumulator + currentValue.transferSize;
  },0);
  return total;
}

const total_requests = () => {
    return metrics.length;
}

/*
** SEND PAGE VISIT METRICS TO DATABASE SERVER UNLESS LOGGED IN AS "ADMIN" OR "OWNER"
*/
const flushQueues = () => {
    //const aud = getJWTClaim("aud");
    //if (aud === "admin" || aud === "owner") return;

    if (page_loaded === 0) return;

    const json = {};
    json["website_id"] = bodydata.websiteid;
    json["article_id"] = bodydata.articleid;
    json["website_loaded"] = website_loaded;
    json["seq"] = page_visit;
    json["webdriver"] = navigator.webdriver;
    json["aud"] = aud;
    if (page_loaded !== 0) {
        json["duration_visible"] =  Math.round((Date.now() - page_loaded)/1000);
        page_loaded = 0;
    }

    /* Send full details only on first page visit to save network cost */
    if (page_visit === 0) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            json["connection"] = connection.downlink + " Mb/s" + " -" + connection.effectiveType;
        }
        if (navigator.userAgentData) {
            json["mobile"] = navigator.userAgentData.mobile;
        }
        json["url"] = window.location.hostname;
        json["referrer"] = document.referrer;

        json["page_weight"] = page_weight();
        json["total_requests"] = total_requests();
        json['pages_visited'] = Array.from(pages_set).toString();

        vitalsQueue.add({name:"page_weight",value:page_weight()});
        vitalsQueue.add({name:"total_requests",value:total_requests()});
    }

    if (vitalsQueue.size > 0) {
        for (const item of vitalsQueue.values()) {
            json[item.name] = item.value;
            json[item.name+"_rating"] = item.rating;
        }
        vitalsQueue.clear();
    }

    const body = JSON.stringify(json);
    page_visit++;

    if (navigator.webdriver) return;
    if (json["duration_visible"]<=1) return;

    (navigator.sendBeacon && navigator.sendBeacon(bodydata.resturl+"page-visit", body)) || fetch(visit_url, {body, method: 'POST', keepalive: true});
}


/*
** REPORT GATHERED PAGE STATISTICS WHEN PAGE VISIBILITY CHANGES
*/
addEventListener('visibilitychange', () => {
    if (document.visibilityState === "hidden") {
        flushQueues();
    } else {
        page_loaded = Date.now();
    }
}, { capture: true} );

if ('onpagehide' in self) {
    addEventListener('pagehide', () => {
        flushQueues();
    }, { capture: true} );
}

const load_edited_page = async () => {
    await importmap();
    const module_name = "deploy_edited-content";
    const module = await import(module_name)
    .catch((error) => {
        console.error(error);
        console.error("Failed to load " + module_name);
    });
    module.init();
}
/*
** INITIALIZE EDITOR IF PAGE PREVIOUSLY EDITED IN THE SESSION
*/
const pages_edited = JSON.parse(sessionStorage.getItem("pages_edited"));
const pages_edited_set = new Set(pages_edited);
if (pages_edited_set.has(Number(document.body.dataset.articleid))) {
    load_edited_page();
}

/*
** MAINTAIN ARRAY OF PERFORMANCE AND NAVIGATION DETAILS
*/
const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        if (metrics.some( ({name}) => name===entry.name)) return;
        metrics.push({entryType: entry.entryType, name:entry.name, transferSize:entry.transferSize, contentType: entry.contentType});        
    })
});
observer.observe({ type: "resource", buffered: true });
observer.observe({ type: "navigation", buffered: true });

/*
** ADD CWV METRIC TO QUEUE WHEN EMITTED
*/
const addToVitalsQueue = ({name,value,rating}) => {
    console.log(name,value);
    vitalsQueue.add({name:name,value:value,rating:rating});
};

/*
** START CORE WEB VITALS COLLECTION USING SELF-HOSTED GOOGLE LIBRARY
*/
import { onTTFB, onFCP, onLCP, onCLS, onINP } from "/javascript/deploy_web_vitals5.min.js";
onTTFB(addToVitalsQueue);
onFCP(addToVitalsQueue);
onLCP(addToVitalsQueue);
onCLS(addToVitalsQueue);
onINP(addToVitalsQueue);

/*
** GET WEB-vitAls TO EMIT
*/
document.body.click();