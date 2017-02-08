import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders } from '.';

export function getPatientList(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };
    return buildGetService('/api/v1/patients/', _.identity, _.merge({}, defaultHeaders, headers));
}

export function getPatient(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };
    return (patientPk, cursor) => {
        const _getPatient = buildGetService(
            `/api/v1/patients/${patientPk}/skin_images/`,
            (items) => _.map(items, (data) => (
                {
                    data,
                    status: 'Succeed',
                })),
            _.merge({}, defaultHeaders, headers));
        return _getPatient(cursor);
    };
}

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


export function createPatient(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };
    return buildPostService('/api/v1/patients/',
                            'POST',
                            JSON.stringify,
                            _.identity,
                            _.merge({}, defaultHeaders, headers));
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

export function getAnatomicalSites() {
    const anatomicalSites = ['Left Arm', 'Left Leg', 'Right Arm', 'Right Leg',
        'Stomach', 'Back', 'Neck'];

    return anatomicalSites;
}

export function getRacesList() {
    const races = ['Native Hawaiian', 'Pacific Islander', 'Native Hawaiian/Pacific Islander',
        'Race 4', 'Race 5', 'Race 6', 'Race 7'];

    return races;
}
