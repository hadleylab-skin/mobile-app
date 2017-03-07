import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders } from './base';

export function getImageService(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };
    return (patientPk, imagePk, cursor) => {
        const _getImage = buildGetService(
            `/api/v1/patients/${patientPk}/skin_images/${imagePk}/`,
            _.identity,
            _.merge({}, defaultHeaders, headers));
        return _getImage(cursor);
    };
}

export function updateImageService(token) {
    const headers = {
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
    };

    return (patientPk, imagePk, cursor, data) => {
        const _updateImage = buildPostService(
            `/api/v1/patients/${patientPk}/skin_images/${imagePk}/`,
            'PUT',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers));
        return _updateImage(cursor, data);
    };
}

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

export function clinicalPhotoService(token) {
    const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
    };

    return (patientPk, cursor, data) => {
        const _service = buildPostService(
            `/api/v1/patients/${patientPk}/upload_clinical_photo/`,
            'POST',
            hidrateImage,
            _.identity,
            _.merge({}, defaultHeaders, headers));
        return _service(cursor, data);
    };
}
