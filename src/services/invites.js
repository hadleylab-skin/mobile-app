import _ from 'lodash';
import { encryptRSA } from './keypair';
import { buildGetService, buildPostService, defaultHeaders } from './base';
import { encryptPatientDataWithKey, needEncryption, dehydratePatientData } from './patients';

const inviteStatuses = {
    1: 'new',
    2: 'accepted',
    3: 'declined',
};

function dehydrateInvites(data) {
    const updatedData = _.map(data,
        (item) => _.merge(item, {
            status: inviteStatuses[`${item.status}`],
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

function dehydrateInvitationData(invitations) {
    return Promise.all(_.map(
        invitations,
        async (invitation) => {
            let item = invitation;
            item.patient = await dehydratePatientData(item.patient);
            return item;
        }));
}

export function getPatientsWaitingForDoctorApproveService({ token }) {
    const headers = {
        Authorization: `JWT ${token.get()}`,
    };

    return (cursor) => {
        const _service = buildGetService(
            '/api/v1/study/invites_doctor/',
            dehydrateInvitationData,
            _.merge({}, defaultHeaders, headers));

        return _service(cursor);
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

export function declineInviteForDoctorService({ token }) {
    const headers = {
        Authorization: `JWT ${token.get()}`,
    };

    return (cursor, invite) => {
        const _service = buildPostService(
            `/api/v1/study/invites_doctor/${invite.pk}/decline/`,
            'POST',
            JSON.stringify,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return _service(cursor, {});
    };
}

async function hydrateInviteData({ doctor, participant, patient }) {
    const aesKey = Math.random().toString(36).substring(2);
    let encryptionKeys = {};
    encryptionKeys[`${doctor.pk}`] = await encryptRSA(aesKey, doctor.publicKey);
    encryptionKeys[`${participant.pk}`] = await encryptRSA(aesKey, participant.publicKey);

    if (doctor.myCoordinatorId) {
        encryptionKeys[`${doctor.myCoordinatorId}`] = await encryptRSA(
            aesKey, doctor.coordinatorPublicKey);
    }

    let hydratedData = {};
    _.forEach(needEncryption, (key) => { hydratedData[key] = patient[key]; });
    hydratedData = encryptPatientDataWithKey(hydratedData, aesKey);
    hydratedData.encryptionKeys = JSON.stringify(encryptionKeys);

    return JSON.stringify(hydratedData);
}

export function approveInviteForDoctorService({ token }) {
    const headers = {
        Authorization: `JWT ${token.get()}`,
    };

    return async (cursor, invite) => {
        const _service = buildPostService(
            `/api/v1/study/invites_doctor/${invite.pk}/approve/`,
            'POST',
            hydrateInviteData,
            _.identity,
            _.merge({}, defaultHeaders, headers)
        );

        return _service(cursor, invite);
    };
}
