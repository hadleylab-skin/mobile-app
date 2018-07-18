import _ from 'lodash';
import { buildGetService, defaultHeaders } from './base';


export function getDefaultConsentDocsService({ token }) {
    const headers = {
        Authorization: `JWT ${token.get()}`,
    };

    return buildGetService(
        '/api/v1/study/consent_doc/default/',
        _.identity,
        _.merge({}, defaultHeaders, headers));
}
