const bodydata = document.body.dataset;
const dropdown = document.querySelector("#menulist");
const dialog_close = document.querySelector("dialog.output .close");
const vitalsQueue = new Set();
const metrics = [];

/* 
** POLYFILL FOR ANCHOR POSITIONING
*/
if (!("anchorName" in document.documentElement.style)) {
    import("https://unpkg.com/@oddbird/css-anchor-positioning");
}

/* 
** CHECK IF EDITOR URL
*/
const is_editor = () => {
    return window.location.host.startsWith("editor.") || window.location.host.endsWith(".netlify.app");
}

let aud = "";
const jwt = localStorage.getItem("refresh");

async function load_modules() { 
    let module_name = "deploy_menulist"
    const menu = await import(module_name)
    .catch((error) => {
        console.error(error);
        console.error("Failed to load " + module_name);
        return;
    });
    new menu.MenuNavigationHandler(dropdown);

    if (jwt) {
        if (is_editor()) {
            module_name = "deploy_edited-content";
            const module = await import(module_name)
            .catch((error) => {
                console.error(error);
                console.error("Failed to load " + module_name);
                return;
            });
            module.init();
        }
    }

    module_name = "deploy_web_vitals5";
    const cwv = await import("deploy_web_vitals5")
    .catch((error) => {
        console.error(error);
        console.error("Failed to load " + module_name);
        return;
    });
    cwv.onTTFB(addToVitalsQueue);
    cwv.onFCP(addToVitalsQueue);
    cwv.onLCP(addToVitalsQueue);
    cwv.onCLS(addToVitalsQueue);
    cwv.onINP(addToVitalsQueue);
}
load_modules();

/* 
** DIALOG CLOSE BUTTON
*/
const closeHandler = (e) => {
    e.target.closest("dialog").close();
}
dialog_close.addEventListener("click", closeHandler);

/*
** GET DROPDOWN MENU FROM LOCALSTORAGE IF USER LOGGED IN
** LOGOUT IF NOT LATEST MENU VERSION (I.E. <button>)
*/
if (jwt) {
    if (localStorage.getItem("menulist").startsWith("<button")) {
        dropdown.replaceChildren();
        dropdown.insertAdjacentHTML('beforeend',localStorage.getItem("menulist"));
        const array = jwt.split(".");
        const parse = JSON.parse(atob(array[1]));
        aud = parse.aud;
        console.log("Refresh token exists. User is logged in as " + aud);
    } else {
        localStorage.clear();
    }
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

const first_visit = () => {
    if (metrics.some( ({transferSize}) => transferSize<=300)) {
        return 0;
    } else {
        return 1;
    }
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
    json["url"] = window.location.hostname;
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
        json["pathname"] = window.location.pathname;
        json["referrer"] = document.referrer;

        json["page_weight"] = page_weight();
        json["total_requests"] = total_requests();
        json["first_visit"] = first_visit();
        
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

    if (navigator.webdriver || navigator.userAgent.toLowerCase().includes('headless') || navigator.languages.length === 0) return;
    if (json["duration_visible"]<=1) return;
    if (is_editor()) return; 

    (navigator.sendBeacon && navigator.sendBeacon(bodydata.resturl+"page-visit/"+bodydata.websiteid+"/"+bodydata.articleid, body)) || fetch(visit_url, {body, method: 'POST', keepalive: true});
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

/*
** MAINTAIN ARRAY OF PERFORMANCE AND NAVIGATION DETAILS
*/
const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        if (metrics.some( ({name}) => name===entry.name)) return;
        metrics.push({entryType: entry.entryType, name:entry.name, transferSize:entry.transferSize, contentType: entry.contentType, initiatorType: entry.initiatorType});        
    })
});
observer.observe({ type: "resource", buffered: true });
observer.observe({ type: "navigation", buffered: true });

/*
** ADD CWV METRIC TO QUEUE WHEN EMITTED
*/
let metric_supported;
if ('LargestContentfulPaint' in window) {
    metric_supported = "LCP";
} else {
    metric_supported = "FCP";
}

const addToVitalsQueue = ({name,value,rating}) => {
    console.log(name,value);
    vitalsQueue.add({name:name,value:value,rating:rating});
    
    if (name===metric_supported) {
        if (!sessionStorage.getItem(name)) {
            sessionStorage.setItem(name,value);
            sessionStorage.setItem("metrics",JSON.stringify(metrics));
        }
    }
};

/*
** FORCE WEB-VITALS TO EMIT
*/
document.body.click();