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

export const loginService = buildPostService(
    '/api/v1/auth/login/',
    'POST',
    JSON.stringify,
    dehydrateData,
    defaultHeaders);

export const resetPasswordSerice = buildPostService(
    '/api/v1/auth/password/reset/');

export const signUpService = buildPostService(
    '/api/v1/auth/register/');

export const signUpAsParticipantService = buildPostService(
    '/api/v1/auth/register_as_participant/');
