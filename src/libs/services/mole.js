import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders, wrapItemsAsRemoteData, hydrateImage } from './base';

function convertListToDict(list) {
    return _.keyBy(list, (item) => item.data.pk);
}

function dehydrateMoles(moles) {
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
            dehydrateMoles,
            _.merge({}, defaultHeaders, headers));

        return _service(cursor);
    };
}

export function getMoleService(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (patientPk, molePk, cursor) => {
        const _service = buildGetService(
            `/api/v1/patient/${patientPk}/mole/${molePk}`,
            _.identity,
            _.merge({}, defaultHeaders, headers));

        return _service(cursor);
    };
}

function hydrateData(mole) {
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
            hydrateData,
            _.identity,
            _.merge({}, defaultHeaders, headers));
        return _service(cursor, data);
    };
}
