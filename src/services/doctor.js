import _ from 'lodash';
import { buildPostService, buildGetService, defaultHeaders } from './base';

export function getDoctorService({ token }) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (cursor) => {
        const _service = buildGetService(
            '/api/v1/auth/current_user/',
            _.identity,
            _.merge({}, defaultHeaders, headers));

        return _service(cursor);
    };
}

export function updateDoctorService({ token }) {
    const headers = {
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
    };

    return (cursor, data) => {
        const service = buildPostService('/api/v1/auth/current_user/',
            'PATCH',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers));
        return service(cursor, data);
    };
}
