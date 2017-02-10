import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders } from '.';

export function getImage(token) {
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

function hidrateImage(image) {
    const photo = {
        uri: image.path,
        type: 'image/jpeg',
        name: 'photo.jpg',
    };
    let data = new FormData();
    data.append('file', photo);
    return data;
}

export function uploadClinicalPhoto(token, patientPk) {
    const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
    };
    return buildPostService(`/api/v1/patients/${patientPk}/upload_clinical_photo/`,
                            'POST',
                            hidrateImage,
                            _.identity,
                            _.merge({}, defaultHeaders, headers));
}