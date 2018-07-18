import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders } from './base';


export function getStudiesService({ token }) {
    const headers = {
        Authorization: `JWT ${token.get()}`,
    };

    return buildGetService(
        '/api/v1/study/',
        _.identity,
        _.merge({}, defaultHeaders, headers));
}

function hydrateStudyConsentData({ signature, patientPk }) {
    let data = new FormData();
    data.append('signature', signature);
    data.append('patient_pk', patientPk);
    return data;
}

export function addStudyConsentService({ token }) {
    const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `JWT ${token.get()}`,
    };

    return (studyPk, cursor, data) => {
        const _service = buildPostService(
            `/api/v1/study/${studyPk}/add_consent/`,
            'POST',
            hydrateStudyConsentData,
            _.identity,
            _.merge({}, defaultHeaders, headers));
        return _service(cursor, data);
    };
}
