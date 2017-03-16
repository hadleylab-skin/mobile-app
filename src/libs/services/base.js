import _ from 'lodash';

export function checkStatus(response) {
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

export const url = 'https://api.skiniq.co';

export function buildGetService(path,
                                dehydrate = _.identity,
                                headers = defaultHeaders) {
    return async (cursor) => {
        cursor.set('status', 'Loading');
        let result = {};

        try {
            let response = await fetch(`${url}${path}`,
                                       { headers }).then(checkStatus);
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
        cursor.set('status', 'Loading');
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
            cursor.set(result);
        } catch (error) {
            result = {
                error,
                status: 'Failure',
            };
            cursor.set('error', result.error);
            cursor.set('status', result.status);
        }
        return result;
    };
}

export function wrapItemsAsRemoteData(items) {
    return _.map(items, (data) => (
        {
            data,
            status: 'Succeed',
        })
    );
}
