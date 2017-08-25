import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders, wrapItemsAsRemoteData, hydrateImage } from './base';

function dehydrateMrn(item) {
    return _.merge(
        {},
        item,
        { mrn: `${typeof item.mrn === 'number' ? item.mrn : ''}` });
}

function dehydrateConsent(item) {
    return _.merge(
        item,
        {
            validConsent: {
                status: 'Succeed',
                data: item.validConsent,
            },
        }
    );
}

function dehydratePatientData(data) {
    return dehydrateConsent(dehydrateMrn(data));
}

function convertListToDict(list) {
    return _.keyBy(list, (patient) => patient.data.pk);
}

function dehydratePatients(patients) {
    const data = _.map(
        patients,
        dehydratePatientData);

    return convertListToDict(wrapItemsAsRemoteData(data));
}

function concatParams(data) {
    let params = '';

    _.map(data, (item, key) => {
        if (!item) {
            return;
        }

        const paramKey = _.snakeCase(key);
        let value = item;

        if (typeof value === 'boolean') {
            value = _.upperFirst(`${value}`);
        }

        if (params.length > 0) {
            params += '&' + paramKey + '=' + value;
        } else {
            params += paramKey + '=' + value;
        }
    });

    return params;
}

export function patientsService(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor, params) => {
        const service = buildGetService(
            `/api/v1/patient/?${concatParams(params)}`,
            dehydratePatients,
            _.merge({}, defaultHeaders, headers)
        );

        return service(cursor);
    };
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

export function getPatientService(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (patientPk, cursor) => {
        const service = buildGetService(`/api/v1/patient/${patientPk}/`,
            dehydratePatientData,
            _.merge({}, defaultHeaders, headers));

        return service(cursor);
    };
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

function hydrateConsentData(base64IMage) {
    let data = new FormData();
    data.append('signature', base64IMage);
    return data;
}

export function updatePatientConsentService(token) {
    const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
    };

    return (patientPk, cursor, data) => {
        const _updatePatient = buildPostService(`/api/v1/patient/${patientPk}/consent/`,
                                                'POST',
                                                hydrateConsentData,
                                                _.identity,
                                                _.merge({}, defaultHeaders, headers));
        return _updatePatient(cursor, data);
    };
}
