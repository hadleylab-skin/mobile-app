import _ from 'lodash';
import { buildPostService, defaultHeaders } from './base';

export function updateDoctorService(token) {
    const headers = {
        Accept: 'application/json',
        Authorization: `JWT ${token}`,
    };

    return (cursor, data) => {
        const _updateDoctor = buildPostService('/api/v1/auth/current_user/',
            'PATCH',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers));
        return _updateDoctor(cursor, data);
    };
}
