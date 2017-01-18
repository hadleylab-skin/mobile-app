import { buildPostService } from '.';

export const loginService = buildPostService('/api/v1/auth/login/');
