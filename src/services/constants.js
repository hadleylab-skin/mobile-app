import { buildGetService } from './base';

export function getRacesList() {
    return {
        data: [
            [1, 'American, Indian or Alaska native'],
            [2, 'Asian'],
            [3, 'Black or African American'],
            [4, 'Hispanic or Latino'],
            [5, 'Native Hawaiian or Pacific Islander'],
            [6, 'White'],
        ],
        status: 'Succeed',
    };
}

export const getSitesService = buildGetService('/api/v1/auth/sites/');
