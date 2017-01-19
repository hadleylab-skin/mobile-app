import _ from 'lodash';
import { buildGetService, defaultHeaders } from '.';

export default function (token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };
    return buildGetService('/api/v1/patients/', _.identity, _.merge({}, defaultHeaders, headers));
}
