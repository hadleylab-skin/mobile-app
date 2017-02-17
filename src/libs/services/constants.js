import _ from 'lodash';
import { buildGetService, defaultHeaders } from '.';

export function getAnatomicalSiteList(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };
    return buildGetService('/api/v1/constants/anatomical_sites/', _.identity, _.merge({}, defaultHeaders, headers));
}

export function getRacesList(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };
    return buildGetService('/api/v1/constants/races/', _.identity, _.merge({}, defaultHeaders, headers));
}
