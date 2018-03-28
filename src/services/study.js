import _ from 'lodash';
import { buildGetService, buildPostService, defaultHeaders } from './base';


function dehydrateStudies(items) {
    return items;
}

export function getStudiesService({ token }) {
    const headers = {
        Authorization: `JWT ${token.get()}`,
    };

    return (cursor) => {
        const _service = buildGetService(
            `/api/v1/study/`,
            dehydrateStudies,
            _.merge({}, defaultHeaders, headers));

        return _service(cursor);
    };
}

export function getInvitesOfStudyService({ token }) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (studyPk, cursor) => {
        const _service = buildGetService(
            `/api/v1/study/${studyPk}/invites/`,
            _.identity,
            _.merge({}, defaultHeaders, headers));

        return _service(cursor);
    };
}
