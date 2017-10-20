import _ from 'lodash';

import {
    buildPostService, buildGetService,
    defaultHeaders, convertListToDict,
    wrapItemsAsRemoteData,
} from './base';
import { encryptRSA, decryptRSA } from './keypair';


export function getSiteJoinRequestsService({ token }) {
    const headers = {
        Authorization: `JWT ${token.get()}`,
    };

    return (cursor) => {
        const _service = buildGetService(
            '/api/v1/site_join_requests/',
            _.flow([wrapItemsAsRemoteData, convertListToDict]),
            _.merge({}, defaultHeaders, headers));

        return _service(cursor);
    };
}

export function createSiteJoinRequestService({ token }) {
    const headers = {
        Accept: 'application/json',
        Authorization: `JWT ${token.get()}`,
    };

    return buildPostService('/api/v1/site_join_requests/',
                            'POST',
                            JSON.stringify,
                            _.identity,
                            _.merge({}, defaultHeaders, headers));
}

async function encryptKeys({ keys, coordinatorPublicKey }) {
    const [ids, plainKeys] = _.unzip(_.toPairs(keys));
    const encryptedKeys = await Promise.all(
        _.map(plainKeys,
              async (key) => {
                  const plainKey = await decryptRSA(key);
                  return encryptRSA(plainKey, coordinatorPublicKey);
              }));
    const res = JSON.stringify({
        encryptedKeys: _.fromPairs(_.zip(ids, encryptedKeys)),
    });
    return res;
}

export function confirmSiteJoinRequestService({ token }) {
    const headers = {
        Accept: 'application/json',
        Authorization: `JWT ${token.get()}`,
    };

    return (cursor, doctorPk, data) => {
        const service = buildPostService(`/api/v1/site_join_requests/${doctorPk}/confirm/`,
                                         'POST',
                                         encryptKeys,
                                         _.identity,
                                         _.merge({}, defaultHeaders, headers));
        return service(cursor, data);
    };
}

