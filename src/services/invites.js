import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders } from './base';

const inviteStatuses = {
    '1': 'new',
    '2': 'accepted',
    '3': 'declined',
};

function dehydrateInvites(data) {
    const updatedData = _.map(data,
        (item) => _.merge(item, {
            status: inviteStatuses[`${item.status}`]
        }));

    return updatedData;
}

export function getInvitesService({ token }) {
    const headers = {
        Authorization: `JWT ${token.get()}`,
    };

    return (cursor) => {
        const _service = buildGetService(
            '/api/v1/study/invites/',
            dehydrateInvites,
            _.merge({}, defaultHeaders, headers)
        );

        return _service(cursor);
    };
}

export function approveInviteService({ token }) {
    const headers = {
        Authorization: `JWT ${token.get()}`,
    };

    return (invitePk, cursor, data) => {
        const _service = buildPostService(
            `/api/v1/study/invites/${invitePk}/approve/`,
            'POST',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );
        return _service(cursor, data);
    };
}

export function declineInviteService({ token }) {
    const headers = {
        Authorization: `JWT ${token.get()}`,
    };

    return (invitePk, cursor) => {
        const _service = buildPostService(
            `/api/v1/study/invites/${invitePk}/decline/`,
            'POST',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );
        return _service(cursor, {});
    };
}

export function sendInviteToDoctorService({ token }) {
    const headers = {
        Authorization: `JWT ${token.get()}`,
    };

    return (cursor, data) => {
        const _service = buildPostService(
            '/api/v1/study/invites_doctor/',
            'POST',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return _service(cursor, data);
    };
}
