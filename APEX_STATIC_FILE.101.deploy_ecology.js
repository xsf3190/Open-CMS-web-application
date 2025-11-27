/*
**  ECOLOGY MODULE - SEND METRICS TO UNPROTECTED ENDPOINT
*/
import { bodydata, initDialog } from "deploy_elements";

export const init = async (e) => {

    const url = bodydata.resturl + e.dataset.endpoint.replace(":ID",bodydata.websiteid).replace(":PAGE",bodydata.articleid);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    
    let config = {method: e.dataset.method, headers: headers};
    const lcp = sessionStorage.getItem("LCP");
    const fcp = sessionStorage.getItem("FCP");
    const metrics = JSON.parse(sessionStorage.getItem("metrics"));
    config["body"] = JSON.stringify({metrics:metrics,lcp:lcp,fcp:fcp});

    const response = await fetch(url, config);
    const result = await response.json();

    initDialog(result);
}