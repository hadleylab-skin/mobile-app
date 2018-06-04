import _ from 'lodash';
import { buildPostService, buildGetService, defaultHeaders, hydrateImage } from './base';

export function getDoctorService({ token }) {
    const headers = {
        Authorization: `JWT ${token.get()}`,
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
        Authorization: `JWT ${token.get()}`,
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

function hydratePhotoData({ photo }) {
    let data = new FormData();
    data.append('photo', hydrateImage(photo));
    return data;
}

export function updateDoctorPhotoService({ token }) {
    const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `JWT ${token.get()}`,
    };

    return (cursor, data) => {
        const service = buildPostService(
            '/api/v1/auth/current_user/',
            'PATCH',
            hydratePhotoData,
            _.identity,
            _.merge({}, defaultHeaders, headers));
        return service(cursor, data);
    };
}

export function getDoctorKeyListService({ token }) {
    const headers = {
        Authorization: `JWT ${token.get()}`,
    };

    return (cursor, doctorPks) => {
        const doctors = doctorPks.join(',');
        const service = buildGetService(
        `/api/v1/doctor/public_keys/?doctors=${doctors}`,
        _.identity,
        _.merge({}, defaultHeaders, headers));
        return service(cursor);
    };
}
