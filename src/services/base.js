import _ from 'lodash';

export function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    return response.json().then((data) => {
        throw {
            response,
            data,
        };
    });
}

export const defaultHeaders = {
    'Content-Type': 'application/json',
};

export const url = 'https://skin.hadleylab.com';

export function buildGetService(path,
                                dehydrate = _.identity,
                                headers = defaultHeaders) {
    return async (cursor) => {
        cursor.set('status', 'Loading');
        let result = {};

        try {
            let response = await fetch(`${url}${path}`,
                                       { headers }).then(checkStatus);
            const data = await response.json();
            const dehydratedData = await dehydrate(data);
            result = {
                data: dehydratedData,
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

        const body = await hydrate(data);
        const payload = {
            body,
            method,
            headers,
        };

        try {
            let response = await fetch(`${url}${path}`, payload).then(checkStatus);
            let dehydratedData = cursor.get('data');
            if (response.status !== 204) {
                const respData = await response.json();
                dehydratedData = await dehydrate(respData);
            }
            result = {
                status: 'Succeed',
                data: dehydratedData,
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

export function hydrateImage(uri) {
    const photo = {
        uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
    };

    return photo;
}

export function convertListToDict(list) {
    return _.keyBy(list, (patient) => patient.data.pk);
}

