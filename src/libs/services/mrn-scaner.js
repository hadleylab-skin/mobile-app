import { checkStatus, url } from '.';

function hydrateImage(image) {
    const photo = {
        uri: image.path,
        type: 'image/jpeg',
        name: 'photo.jpg',
    };
    let data = new FormData();
    data.append('file', photo);
    return data;
}

export async function mrnScanerService(photo) {
    const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
    };

    let result = {};

    const payload = {
        body: hydrateImage(photo),
        method: 'POST',
        headers,
    };

    try {
        let response = await fetch(`${url}/api/ocr/`, payload).then(checkStatus);
        let respData = await response.json();
        result = {
            data: respData,
            status: 'Succeed',
        };
    } catch (error) {
        result = {
            error,
            status: 'Failure',
        };
    }
    return result;
}
