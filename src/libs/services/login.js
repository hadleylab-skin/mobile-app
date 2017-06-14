import { buildPostService, defaultHeaders } from './base';

function dehydrateData(data) {
    let newData = {};

    newData.token = data.token;
    newData.doctor = {
        data: { ...data.doctor },
        status: 'Succeed',
    };

    return newData;
}

export function loginService(cursor, data) {
    const service = buildPostService(
        '/api/v1/auth/login/',
        'POST',
        JSON.stringify,
        dehydrateData,
        defaultHeaders);

    return service(cursor, data);
}

