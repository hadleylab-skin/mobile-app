import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders, hydrateImage, wrapItemsAsRemoteData } from './base';

function dehydrateAnatomicalSites(items) {
    let data = wrapItemsAsRemoteData(_.map(items));

    data = _.groupBy(data, (item) => item.data.anatomicalSite);

    return data;
}

export function getAnatomicalSitesService(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (patientPk, cursor) => {
        const _service = buildGetService(
            `/api/v1/patient/${patientPk}/anatomical_site/`,
            dehydrateAnatomicalSites,
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
