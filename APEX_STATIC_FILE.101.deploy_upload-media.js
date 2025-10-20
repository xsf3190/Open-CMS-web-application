/* 
 ** CREATE AND OPEN CLOUDINARY UPLOAD WIDGET
 */

import { bodydata } from "deploy_elements";
import { callAPI, handleError } from "deploy_callAPI";

let widget;

const writeClipboard = async (url) => {
    try {
        await navigator.clipboard.writeText(url.substring(0,url.lastIndexOf(".")));
    } catch (error) {
        handleError(error);
    }
}

const createWidget =  async (cloudName, uploadPreset, multiple) => {
    
    console.log("createWidget",cloudName,uploadPreset,multiple);
    widget=cloudinary.createUploadWidget(
    { 
        uploadPreset: uploadPreset,
        cloudName: cloudName,
        multiple: multiple,
        cropping: !multiple,
        singleUploadAutoClose: false,
        clientAllowedFormats: ['image','video','audio'],
        maxFiles: 10
    },
    (error, result) => {
        if (!error && result && result.event === "success") { 
            console.log('Done! Here is the image info: ', result.info);
            let metadata = {
                images: []
            }
            
            if (result.info.files) {
                result.info.files.forEach((item) => {
                    metadata.images.push({
                        "public_id": item.uploadInfo.public_id,
                        "bytes": item.uploadInfo.bytes,
                        "resource_type": item.uploadInfo.resource_type,
                        "width": item.uploadInfo.width,
                        "height": item.uploadInfo.height,
                        "format": item.uploadInfo.format,
                        "cld_cloud_name": item.uploadInfo.url.split("/")[3],
                        "article_id": item.uploadInfo.tags[0]
                    });
                });
            } else {
                metadata.images.push({
                    "public_id": result.info.public_id,
                    "bytes": result.info.bytes,
                    "resource_type": result.info.resource_type,
                    "width": result.info.width,
                    "height": result.info.height,
                    "format": result.info.format,
                    "cld_cloud_name": result.info.url.split("/")[3],
                    "article_id": result.info.tags[0]
                });
            }
            
            callAPI("upload-media/:ID/:PAGE","PUT",metadata)
                .then( () => {
                    console.log("Uploaded MEDIA metadata successfully");
                    // writeClipboard(result.info.secure_url);
                })
                .catch((error) => {
                    handleError(error);
                });
        }
    });
};

const loadScript = async (url, cloudName, uploadPreset, multiple) => {
    return new Promise((resolve, reject) => {
        if (widget) {
            resolve("Widget already created");
            return;
        }

        let script = document.createElement('script');

        script.addEventListener('load', () => {
            createWidget(cloudName, uploadPreset, multiple);
            resolve("Cloudinary Upload Widget created");
        });

        script.addEventListener('error', () => {
            reject("Cloudinary upload widget script failed to load");
        });

        script.src = url;
        document.head.appendChild(script);
  });
}

/*
** This module is initialized from CKEditor as a request to
** 1) upload and optionally crop a single image, OR 
** 2) upload multiple images
*/
export const init = (multiple) => {
    const arrayToken = localStorage.getItem("refresh").split(".");
    const parsedToken = JSON.parse(atob(arrayToken[1]));
    const cloudName = parsedToken.cld_cloud_name;
    let uploadPreset = parsedToken.cld_upload_preset;

    /*
    ** The default preset if for multiple image uploads
    */
    if (!multiple) {
        uploadPreset += '_crop';
    }

    loadScript("https://upload-widget.cloudinary.com/latest/global/all.js", cloudName, uploadPreset, multiple)
        .then((result) => {
            console.log(result);
            widget.open();
            widget.update({
                tags: [bodydata.articleid], 
                multiple: multiple,
                cropping: !multiple,
                uploadPreset: uploadPreset
            });
        })
        .catch((error) => handleError(error));
}