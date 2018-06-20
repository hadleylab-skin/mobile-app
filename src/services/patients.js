import _ from 'lodash';
import CryptoJS from 'crypto-js';
import { buildGetService, buildPostService, defaultHeaders, wrapItemsAsRemoteData, hydrateImage } from './base';
import { encryptAES, encryptRSA, decryptAES, decryptRSA } from './keypair';

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

const needEncryption = ['firstName', 'lastName', 'mrn', 'dateOfBirth'];

async function dehydratePatientData(data) {
    let dehydratedData = { ...dehydrateConsent(data) };
    const aesKey = await decryptRSA(dehydratedData.encryptedKey);
    _.forEach(_.pickBy(dehydratedData), (value, key) => {
        if (_.includes(needEncryption, key) && value !== '') {
            try {
                dehydratedData[key] = decryptAES(value, aesKey);
            } catch (error) {
                throw 'patient_decryption_error';
            }
        }
    });
    return dehydratedData;
}

function convertListToDict(list) {
    return _.keyBy(list, (patient) => patient.data.pk);
}

async function dehydratePatients(patients) {
    const data = await Promise.all(_.map(
        patients,
        dehydratePatientData));

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
            params += `&${paramKey}=${value}`;
        } else {
            params += `${paramKey}=${value}`;
        }
    });

    return params;
}

export function patientsService({ token }) {
    const headers = {
        Authorization: `JWT ${token.get()}`,
    };

    return (cursor, params, study = null) => {
        let paramsWithStudy = params;
        if (study) {
            paramsWithStudy = _.merge({}, paramsWithStudy, { study });
        }

        const service = buildGetService(
            `/api/v1/patient/?${concatParams(paramsWithStudy)}`,
            dehydratePatients,
            _.merge({}, defaultHeaders, headers)
        );

        return service(cursor);
    };
}

function hydratePatientData(remoteDoctor) {
    const doctor = remoteDoctor.data.get();
    if (typeof doctor === 'undefined') {
        throw { message: 'System error, context is not loaded' };
    }
    return async ({ doctors, ...patientData }) => {
        let data = new FormData();
        const aesKey = Math.random().toString(36).substring(2);
        let encryptionKeys = {};
        encryptionKeys[`${doctor.pk}`] = await encryptRSA(aesKey);

        if (doctor.myCoordinatorId) {
            encryptionKeys[`${doctor.myCoordinatorId}`] = await encryptRSA(aesKey, doctor.coordinatorPublicKey);
        }

        await Promise.all(_.map(doctors, async (doctorId) => {
            if (!encryptionKeys[`${doctorId}`]) {
                encryptionKeys[`${doctorId}`] = await encryptRSA(
                    aesKey,
                    doctor.myDoctorsPublicKeys[`${doctorId}`]);
            }
        }));

        data.append('encryptionKeys', JSON.stringify(encryptionKeys));

        _.forEach(_.pickBy(patientData), (value, key) => {
            if (value === '' || (key === 'photo' && _.isEmpty(patientData.photo))) {
                // skip empty data
                return;
            }

            if (key === 'photo') {
                data.append('photo', hydrateImage(value.thumbnail));
                return;
            }

            if (_.includes(needEncryption, key)) {
                data.append(key, encryptAES(value, aesKey));
            } else {
                data.append(key, value);
            }

            if (key === 'mrn') {
                data.append('mrnHash', CryptoJS.MD5(value).toString());
            }
        });
        return data;
    };
}

export function getPatientService({ token }) {
    const headers = {
        Authorization: `JWT ${token.get()}`,
    };

    return (patientPk, cursor, study = null) => {
        let url;
        if (study) {
            url = `/api/v1/patient/${patientPk}/?study=${study}`;
        } else {
            url = `/api/v1/patient/${patientPk}/`;
        }

        const service = buildGetService(url,
            dehydratePatientData,
            _.merge({}, defaultHeaders, headers));

        return service(cursor);
    };
}

export function createPatientService({ token, doctor }) {
    const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `JWT ${token.get()}`,
    };

    return buildPostService(
        '/api/v1/patient/',
        'POST',
        hydratePatientData(doctor),
        dehydratePatientData,
        _.merge({}, defaultHeaders, headers)
    );
}

export function updatePatientService({ token }) {
    const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `JWT ${token.get()}`,
    };

    return (patientPk, cursor, data, study, doctor) => {
        let url;
        if (study) {
            url = `/api/v1/patient/${patientPk}/?study=${study}`;
        } else {
            url = `/api/v1/patient/${patientPk}/`;
        }

        const _updatePatient = buildPostService(
            url,
            'PATCH',
            hydratePatientData(doctor),
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

export function updatePatientConsentService({ token }) {
    const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `JWT ${token.get()}`,
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
