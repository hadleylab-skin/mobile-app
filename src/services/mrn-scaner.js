import _ from 'lodash';
import { buildPostService, defaultHeaders } from './base';

function hydrateImage(uri) {
    const photo = {
        uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
    };
    let data = new FormData();
    data.append('file', photo);
    return data;
}

export function mrnScanerService({ token }) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return buildPostService(
        '/api/ocr/',
        'POST',
        hydrateImage,
        _.identity,
        _.merge({}, defaultHeaders, headers));
}
