import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders, wrapItemsAsRemoteData, hydrateImage } from './base';

function convertListToDict(list) {
    return _.keyBy(list, (item) => item.data.pk);
}

function dehydratePatientMoles(moles) {
    const data = _.map(moles);

    return convertListToDict(wrapItemsAsRemoteData(data));
}

export function getPatientMolesService(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (patientPk, cursor) => {
        const _service = buildGetService(
            `/api/v1/patient/${patientPk}/mole/`,
            dehydratePatientMoles,
            _.merge({}, defaultHeaders, headers));

        return _service(cursor);
    };
}

function dehydrateMoleData(data) {
    let newData = data;

    newData.images = wrapItemsAsRemoteData(data.images);

    return newData;
}

export function getMoleService(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (patientPk, molePk, cursor) => {
        const _service = buildGetService(
            `/api/v1/patient/${patientPk}/mole/${molePk}/`,
            dehydrateMoleData,
            _.merge({}, defaultHeaders, headers));

        return _service(cursor);
    };
}

function hydrateMoleData(mole) {
    let data = new FormData();

    data.append('anatomicalSite', mole.anatomicalSite);
    data.append('positionX', mole.positionX);
    data.append('positionY', mole.positionY);
    data.append('photo', hydrateImage(mole.uri));

    return data;
}

export function addMoleService(token) {
    const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
    };

    return (patientPk, cursor, data) => {
        const _service = buildPostService(
            `/api/v1/patient/${patientPk}/mole/`,
            'POST',
            hydrateMoleData,
            _.identity,
            _.merge({}, defaultHeaders, headers));
        return _service(cursor, data);
    };
}

function hydrateMolePhotoData(uri) {
    let data = new FormData();

    data.append('photo', hydrateImage(uri));

    return data;
}

export function addMolePhotoService(token) {
    const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
    };

    return (patientPk, molePk, cursor, data) => {
        const _service = buildPostService(
            `/api/v1/patient/${patientPk}/mole/${molePk}/image/`,
            'POST',
            hydrateMolePhotoData,
            _.identity,
            _.merge({}, defaultHeaders, headers));
        return _service(cursor, data);
    };
}

export function getMolePhotoService(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (patientPk, molePk, imagePk, cursor) => {
        const _service = buildGetService(
            `/api/v1/patient/${patientPk}/mole/${molePk}/image/${imagePk}/`,
            _.identity,
            _.merge({}, defaultHeaders, headers));

        return _service(cursor);
    };
}
