import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders, hydrateImage } from './base';

export function getAnatomicalSitePhotoService(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (patientPk, anatomicalSite, cursor) => {
        const _service = buildGetService(
            `/api/v1/patient/${patientPk}/anatomical_site/${anatomicalSite}/`,
            _.identity,
            _.merge({}, defaultHeaders, headers));

        return _service(cursor);
    };
}

function hydrateData(anatomicalSite) {
    let data = new FormData();

    data.append('anatomicalSite', anatomicalSite.anatomicalSite);
    data.append('distantPhoto', hydrateImage(anatomicalSite.uri));

    return data;
}

export function addAnatomicalSitePhotoService(token) {
    const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
    };

    return (patientPk, cursor, data) => {
        const _service = buildPostService(
            `/api/v1/patient/${patientPk}/anatomical_site/`,
            'POST',
            hydrateData,
            _.identity,
            _.merge({}, defaultHeaders, headers));
        return _service(cursor, data);
    };
}
