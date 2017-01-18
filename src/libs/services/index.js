import _ from 'lodash';

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    return response.json().then((data) => {
        const error = new Error(response.statusText);
        error.response = response;
        error.data = data;
        throw error;
    });
}

export const defaultHeaders = {
    'Content-Type': 'application/json',
};

export const url = 'http://192.168.10.233:8000';
export function buildGetService(path, dehydrate = _.identity) {
    return async (cursor) => {
        cursor.set({ status: 'Loading' });
        let result = {};

        try {
            let response = await fetch(`${url}${path}`).then(checkStatus);
            let data = await response.json();
            result = {
                data: dehydrate(data),
                status: 'Succeed',
            };
        } catch (error) {
            result = {
                error,
                status: 'Failure',
            };
        }
        cursor.set(result);
        return result;
    };
}

export function buildPostService(path,
                                 method = 'POST',
                                 hydrate = JSON.stringify,
                                 dehydrate = _.identity,
                                 headers = defaultHeaders) {
    return async (cursor, data) => {
        cursor.set({ status: 'Loading' });
        let result = {};

        const payload = {
            body: hydrate(data),
            method,
            headers,
        };

        try {
            let response = await fetch(`${url}${path}`, payload).then(checkStatus);
            let respData = await response.json();
            result = {
                data: dehydrate(respData),
                status: 'Succeed',
            };
        } catch (error) {
            result = {
                error,
                status: 'Failure',
            };
        }
        cursor.set(result);
        return result;
    };
}
