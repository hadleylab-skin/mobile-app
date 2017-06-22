import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders, wrapItemsAsRemoteData, hydrateImage } from './base';

function dehydrateMrn(item) {
    return _.merge(
        {},
        item,
        { mrn: `${typeof item.mrn === 'number' ? item.mrn : ''}` });
}

function convertListToDict(list) {
    return _.keyBy(list, (patient) => patient.data.pk);
}

function dehydratePatients(patients) {
    const data = _.map(
        patients,
        dehydrateMrn);

    return convertListToDict(wrapItemsAsRemoteData(data));
}

export function patientsService(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };
    return buildGetService('/api/v1/patient/', dehydratePatients, _.merge({}, defaultHeaders, headers));
}

function hydratePatientData(patientData) {
    let data = new FormData();

    _.forEach(_.pickBy(patientData), (value, key) => {
        if (value === '' || (key === 'photo' && _.isEmpty(patientData.photo))) {
            return;
        }

        if (key === 'mrn') {
            data.append(key, parseInt(value, 10));

            return;
        }

        if (key === 'photo') {
            data.append('photo', hydrateImage(value.thumbnail));

            return;
        }

        data.append(key, value);
    });

    return data;
}

function dehydratePatientData(data) {
    let newData = data;

    if (data.mrn) {
        newData.mrn = `${data.mrn}`;
    }

    return newData;
}

export function createPatientService(token) {
    const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
    };

    return buildPostService(
        '/api/v1/patient/',
        'POST',
        hydratePatientData,
        _.identity,
        _.merge({}, defaultHeaders, headers)
    );
}

export function updatePatientService(token) {
    const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
    };

    return (patientPk, cursor, data) => {
        const _updatePatient = buildPostService(`/api/v1/patient/${patientPk}/`,
            'PATCH',
            hydratePatientData,
            dehydratePatientData,
            _.merge({}, defaultHeaders, headers));
        return _updatePatient(cursor, data);
    };
}
