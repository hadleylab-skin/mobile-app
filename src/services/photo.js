import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders, hydrateImage } from './base';

function hydrateMolePhotoData({ uri, age, currentStudyPk }) {
    let data = new FormData();

    data.append('photo', hydrateImage(uri));
    if (age) {
        data.append('age', age);
    }
    if (currentStudyPk) {
        data.append('study', currentStudyPk);
    }

    return data;
}

function dehydrateMolePhotoData(data) {
    const { biopsy, biopsyData, clinicalDiagnosis, pathDiagnosis } = data;
    let newData = _.omit(data, ['biopsy', 'biopsyData', 'clinicalDiagnosis', 'pathDiagnosis']);

    newData.info = {
        data: {
            biopsy,
            biopsyData,
            clinicalDiagnosis,
            pathDiagnosis,
        },
        status: 'Succeed',
    };

    return newData;
}

export function addMolePhotoService({ token }) {
    const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `JWT ${token.get()}`,
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

export function getMolePhotoService({ token }) {
    const headers = {
        Authorization: `JWT ${token.get()}`,
    };

    return (patientPk, molePk, imagePk, cursor) => {
        const _service = buildGetService(
            `/api/v1/patient/${patientPk}/mole/${molePk}/image/${imagePk}/`,
            dehydrateMolePhotoData,
            _.merge({}, defaultHeaders, headers));

        return _service(cursor);
    };
}

function hydrateUpdateMolePhotoData(imageData) {
    let data = new FormData();
    const keys = _.keys(imageData);

    _.map(keys, (key) => {
        if (typeof imageData[key] !== 'undefined') {
            if (key === 'biopsyData') {
                data.append(key, JSON.stringify(imageData[key]));

                return;
            }

            data.append(key, imageData[key]);
        }
    });

    return data;
}

export function updateMolePhotoService({ token }) {
    const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `JWT ${token.get()}`,
    };

    return (patientPk, molePk, imagePk, cursor, data) => {
        const _service = buildPostService(
            `/api/v1/patient/${patientPk}/mole/${molePk}/image/${imagePk}/`,
            'PATCH',
            hydrateUpdateMolePhotoData,
            _.identity,
            _.merge({}, defaultHeaders, headers));
        return _service(cursor, data);
    };
}
