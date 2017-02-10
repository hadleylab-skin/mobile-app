import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders } from '.';

// REVIEW move to index.js
function wrapItemsAsRemoteData(items) {
    return _.map(items, (data) => (
        {
            data,
            status: 'Succeed',
        })
    );
}

export function getPatientList(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };
    return buildGetService('/api/v1/patients/', wrapItemsAsRemoteData, _.merge({}, defaultHeaders, headers));
}

export function getPatientImages(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };
    return (patientPk, cursor) => {
        const _getPatientImages = buildGetService(
            `/api/v1/patients/${patientPk}/skin_images/`,
            wrapItemsAsRemoteData,
            _.merge({}, defaultHeaders, headers));
        return _getPatientImages(cursor);
    };
}

// REVIEW move to image.js
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

// REVIEW move to image.js
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

// REVIEW move to image.js
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

export function updatePatient(token) {
    return (patientPk) => {
        const headers = {
            Accept: 'application/json',
            Authorization: `JWT ${token}`,
        };
        return buildPostService(`/api/v1/patients/${patientPk}/`,
                                'PUT',
                                JSON.stringify, // REVIEW The data is in a wrong format it should be fixed
                                _.identity,
                                _.merge({}, defaultHeaders, headers));
    };
}

// REVIEW move to constants.js
export function getAnatomicalSites() {
    // REVIEW it is not syncromious function.
    const anatomicalSites = ['Left Arm', 'Left Leg', 'Right Arm', 'Right Leg',
        'Stomach', 'Back', 'Neck'];

    return anatomicalSites;
}


// REVIEW move to constants.js
export function getRacesList() {
    // REVIEW it is not syncromious function.
    const races = ['Native Hawaiian', 'Pacific Islander', 'Native Hawaiian/Pacific Islander',
        'Race 4', 'Race 5', 'Race 6', 'Race 7'];

    return races;
}
