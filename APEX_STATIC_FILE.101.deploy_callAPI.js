import { bodydata, output_dialog, dialog_article, dialog_footer } from "deploy_elements";

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
** REPLACE NEW TOKENS IN STORAGE AND MEMORY
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

/* 
** CALL BACKEND DATABASE API. AUTHENTICATION USES ROTATING JWT TOKENS
*/
const callAPI = async (endpoint, method, data) => {
    console.log("Starting callAPI",endpoint);

    /* Headers object */
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("url", window.location.hostname);
    headers.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);

    /* No tokens involved in Authenticate endpoints. */
    if (!endpoint.includes("authenticate") && !endpoint.includes("auth-verify")) {
        /* Replace refresh and access tokens when access token expired */
        if (expiredToken(access_token)) {
            headers.set("Authorization","Bearer " + refresh_token);
            const refresh_config = {method: "GET", headers: headers};
            try {
                const url = bodydata.resturl + "refresh-token/" + bodydata.websiteid;
                const response = await fetch(url, refresh_config);
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
                const result = await response.json();
                if (result.cause) {
                    throw new Error(`${response.status} - ${result.cause}`);
                }
                if (result.sqlcode) {
                    throw new Error(`${response.status} - ${result.sqlerrm}`);
                }
                replaceTokens(result);
            } catch (e) {
                handleError(e);
            }
        }
    }

    /* Call API passing access token */
    const path = endpoint.replace(":ID",bodydata.websiteid)
                         .replace(":PAGE",bodydata.articleid);
    
    let url = bodydata.resturl + path;
  
    // Append any query parameters to url for GET requests
    if (method==="GET" && data) {
      url+=data;
    }

    headers.set("Authorization","Bearer " + access_token);
    const config = {method: method, headers: headers};
    if (method==="POST" || method==="PUT" || method==="DELETE") {
        config["body"] = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, config);
        console.log("response",response);

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        console.log("result",result);
        
        if (result.cause) {
            throw new Error(`${response.status} - ${result.cause}`);
        }
        if (result.sqlcode) {
            throw new Error(`${response.status} - ${result.sqlerrm}`);
        }
        return(result);
    } catch (e) {
        handleError(e);
    }
}

export { callAPI, replaceTokens };