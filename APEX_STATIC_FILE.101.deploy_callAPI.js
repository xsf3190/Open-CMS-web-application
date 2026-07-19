// import { bodydata, output_dialog, dialog_article, dialog_footer } from "deploy_elements";
const bodydata = document.body.dataset;
const output_dialog = document.querySelector("dialog.output");
const dialog_article = output_dialog.querySelector("article");
const dialog_footer = output_dialog.querySelector("footer");

let access_token = sessionStorage.getItem("token");
let refresh_token = localStorage.getItem("refresh");

/* 
** COMMON ERROR HANDLER FOR IMPORTED MODULES
** "error" is object containing name, message thrown in function "responseok"
*/
const handleError = (error) => {
    console.log("starting handleError", error);
    if (!output_dialog.open) {
        output_dialog.showModal();
    }
    let logout = false;
    dialog_article.replaceChildren();
    let message = "<h4>" + error.name + ": " + error.message + "</h4>";
    if (message.includes("Unauthorized")) {
        console.log("refresh_token",refresh_token);
        console.log("locatStorage",localStorage.getItem("refresh"));
        sessionStorage.clear();
        localStorage.clear();
        message += "<h4>Security precaution against theft</h4>";
        message += "<p>You are being logged out because you have not authenticated from this location or device. Possible causes:</p>";
        message += "<ol>";
        message += "<li>You've connected to a different network</li>";
        message += "<li>You upgraded or changed browser</li>";
        message += "<li>Your device was stolen</li>";
        message += "</ol>";
        message += "<hr>";
        message += "<p>Log in again</p>";
        logout = true;
    }
    dialog_article.insertAdjacentHTML('afterbegin',message);
    
    dialog_footer.replaceChildren();
    dialog_footer.insertAdjacentHTML('afterbegin',"<span></span>");
    
    if (logout) {
        output_dialog.addEventListener("close", () => {
            window.location.reload();
        });
    }
}

/* 
** CHECK IF TOKEN EXPIRED 
*/
const expiredToken = (token) => {
    console.log("Starting expiredToken");
    if (!token) return true;
    const now = Math.floor(new Date().getTime() / 1000);
    const arrayToken = token.split(".");
    const parsedToken = JSON.parse(atob(arrayToken[1]));
    return parsedToken.exp <= now;
}

/* 
** REPLACE NEW TOKENS IN STORAGE AND MEMORY. UPDATE UI
*/
const replaceTokens = (data) => {
    console.log("Starting replaceTokens");
    sessionStorage.setItem("token",data.token);
    access_token = data.token;
    localStorage.setItem("refresh",data.refresh);
    refresh_token = data.refresh;
}

/* 
** COMMON ERROR HANDLER FOR API CALLS
*/
const responseok = (response, result) => {
    if (response.ok && result.success) {
        return(true);
    }
    if (result.cause) {
      throw new Error(`${response.status} - ${result.cause}`);
    }
    if (result.sqlcode) {
      throw new Error(`${response.status} - ${result.sqlerrm}`);
    } else {
      throw new Error(`${result.message}`);
    }
}

const rotate_tokens = async () => {
    console.log("Starting rotate_tokens", refresh_token);
    const url = bodydata.resturl + "refresh-token/" + bodydata.websiteid;
    let refresh_headers = new Headers();
    refresh_headers.append("Content-Type", "application/json");
    refresh_headers.append("url", window.location.hostname);
    refresh_headers.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
    refresh_headers.append("Authorization","Bearer " + refresh_token);
    const refresh_config = {method: "GET", headers: refresh_headers};
    
    const refresh_response = await fetch(url, refresh_config);
    const refresh_result = await refresh_response.json();
    if (responseok(refresh_response, refresh_result)) {
        replaceTokens(refresh_result);
    }
}
/*
try {
    console.log("Check if refresh_token expired");
    if (refresh_token) {
        if (expiredToken(refresh_token)) {
            throw new Error("Unauthorized - Refresh token expired");
        }
    }
    console.log("..refresh_token is valid");
} catch (e) {
    handleError(e);
}
*/

// if (refresh_token && !access_token) {
//     console.log("refresh_token exists but access_token missing - rotate tokens");
//     await rotate_tokens();
// }

/* 
** CALL API FOR RESOURCES EXCLUSIVELY WITH ACCESS TOKEN
*/
const callAPI = async (endpoint, method, data) => {
    console.log("Starting callAPI",endpoint);
    /* No tokens involved in Authenticate endpoints. Obviously. */
    if (!endpoint.includes("authenticate") && !endpoint.includes("auth-verify")) {
        if (expiredToken(access_token)) {
            await rotate_tokens();
        }
    }
      
    const path = endpoint.replace(":ID",bodydata.websiteid)
                         .replace(":PAGE",bodydata.articleid);
    
    let url = bodydata.resturl + path;
  
    // Append any query parameters to url for GET requests
    if (method==="GET" && data) {
      url+=data;
    }
    
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("url", window.location.hostname);
    headers.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
    headers.append("Authorization","Bearer " + access_token);
    
    let config = {method: method, headers: headers};
    if (method==="POST" || method==="PUT" || method==="DELETE") {
        config["body"] = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    const result = await response.json();
  
    if (responseok(response, result)) {
        return(result);
    }
}

export { handleError, callAPI, replaceTokens };