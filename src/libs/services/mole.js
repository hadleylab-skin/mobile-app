import _ from 'lodash';
import { buildGetService, defaultHeaders } from './base';

export function getMolesService(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    return (patientPk, cursor) => {
        const _getMoles = buildGetService(
            `/api/v1/patient/${patientPk}/mole/`,
            _.identity,
            _.merge({}, defaultHeaders, headers));

        return _getMoles(cursor);
    };
}
