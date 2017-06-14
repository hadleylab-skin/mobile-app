import _ from 'lodash';
import { buildGetService, defaultHeaders } from './base';

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
    // return buildGetService('/api/v1/constants/races/', _.identity, _.merge({}, defaultHeaders, headers));
    return {
        data: [
            [1, 'American, Indian or Alaska native'],
            [2, 'Asian'],
            [3, 'Black or African American'],
            [4, 'Hispanic or Latino'],
            [5, 'Native Hawaiian or Pacific Islander'],
            [6, 'White'],
        ],
        status: 'Succeed',
    };
}
