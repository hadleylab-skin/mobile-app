import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders, wrapItemsAsRemoteData } from '.';


function dehydratePatients(patients) {
    const data = _.map(
        patients,
        (item) => _.merge({}, item, { mrn: `${item.mrn || ''}` }));
    return wrapItemsAsRemoteData(data);
}

export function getPatientList(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };
    return buildGetService('/api/v1/patients/', dehydratePatients, _.merge({}, defaultHeaders, headers));
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

export function updatePatient(token) {
    const headers = {
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
    };

    return (patientPk, cursor, data) => {
        const _updatePatient = buildPostService(`/api/v1/patients/${patientPk}/`,
            'PUT',
            JSON.stringify,
            (item) => _.merge({}, item, { mrn: `${item.mrn || ''}` }),
            _.merge({}, defaultHeaders, headers));
        return _updatePatient(cursor, data);
    };
}
