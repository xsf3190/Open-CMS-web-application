const bodydata = document.body.dataset;
const dropdown = document.querySelector("#menulist");
const vitalsQueue = new Set();
const metrics = [];

/* 
** CHECK IF EDITOR URL
*/
const is_editor = window.location.host.startsWith("editor.") || window.location.host.endsWith(".netlify.app") || window.location.host==="cdpn.io";

const set_controls = () => {
    document.querySelector(".controls").style.blockSize = "3rem";
    document.querySelector(".topnav").style.top = "3rem";
}
/* 
** COPY NAV ITEMS TO DROPDOWN ON NARROW VIEWPORTS
*/
const narrow_viewport = window.matchMedia("(width <= 600px)");
if (narrow_viewport.matches) {
    const nav = document.querySelector(".topnav nav ul");
    if (nav) {
        document.querySelector("#navlist ul")?.replaceWith(nav);
        document.getElementById("navlist-btn").style.visibility = "visible";
        set_controls();
    }
}

/*
** If document has <pre> element(s) add PRISM JS AND CSS to document <head>
*/
if (document.querySelector("pre") !== null) {
    /*
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', "https://cdn.jsdelivr.net/npm/prismjs@1.30.0/themes/prism-twilight.min.css");
    document.head.appendChild(link);
    */
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/prismjs@1.30.0/prism.min.js";
    script.type = "module";
    document.body.appendChild(script);
}

/*
** URL FOR NEW WEBSITE EMAIL LINKS INCLUDE TOKENS AND MENULIST
*/
const url = new URL(window.location.href);
if (url.searchParams.has("refresh")) {
    localStorage.setItem("refresh", url.searchParams.get("refresh"));
    localStorage.setItem("menulist", url.searchParams.get("menulist"));
    sessionStorage.setItem("token", url.searchParams.get("token"));
    url.searchParams.delete('token');
    url.searchParams.delete('refresh');
    url.searchParams.delete('menulist');
    history.replaceState(history.state, '', url.href);
    document.getElementById("menulist").togglePopover();
}

let aud = "";
const jwt = localStorage.getItem("refresh");

const ctaHandler = async (e) => {
    const module = await import("deploy_authenticate")
    .catch((error) => {
        console.error(error);
        console.error("Failed to load deploy_authenticate");
        return;
    });
    module.clickHandler(e);
}

async function load_modules() {
    if (is_editor) {
        document.getElementById("menulist-btn").style.visibility = "visible";
        set_controls();
        console.warn("IGNORE FONT LOADING ERRORS AND WARNINGS ON EDITOR WEBSITE");

        const menu = await import("deploy_menulist")
        .catch((error) => {
            console.error(error);
            console.error("Failed to load deploy_menulist");
            return;
        });
        new menu.MenuNavigationHandler(dropdown);
    }
    /* Set clickHandler for any call to action button */
    document.querySelector("button[data-action]")?.addEventListener("click",ctaHandler);

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
** GET DROPDOWN MENU FROM LOCALSTORAGE IF USER LOGGED IN
*/
if (jwt) {
    dropdown.replaceChildren();
    dropdown.insertAdjacentHTML('beforeend',localStorage.getItem("menulist"));
    const array = jwt.split(".");
    const parse = JSON.parse(atob(array[1]));
    aud = parse.aud;
    console.log("Refresh token exists. User is logged in as " + aud);
}

/*
** SETUP COLLECTION OF METRICS. 
*/


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
    if (!sessionStorage.getItem("website_loaded")) {
        sessionStorage.setItem("website_loaded",Math.round(Date.now()/1000));        
    }
    json["website_loaded"] = sessionStorage.getItem("website_loaded");
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
        if (!document.referrer.includes(window.location.hostname)) {
            json["referrer"] = document.referrer;
        }
        json["url"] = window.location.hostname;

        json["page_weight"] = page_weight();
        json["total_requests"] = total_requests();
        json["first_visit"] = first_visit();
        json["timezone"] = Intl.DateTimeFormat().resolvedOptions().timeZone;
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
    if (is_editor) return; 

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
const addToVitalsQueue = ({name,value,rating}) => {
    console.log(name,value);
    vitalsQueue.add({name:name,value:value,rating:rating});
};

/*
** FORCE WEB-VITALS TO EMIT
*/
document.body.click();