import { checkStatus, url } from './base';

function hydrateImage(uri) {
    const photo = {
        uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
    };
    let data = new FormData();
    data.append('file', photo);
    return data;
}

export function mrnScanerService(token) {
    return async (uri) => {
        const headers = {
            Authorization: `JWT ${token}`,
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
        };

        let result = {};

        const payload = {
            body: hydrateImage(uri),
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
    };
}
