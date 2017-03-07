import { buildPostService } from './base';

export const loginService = buildPostService('/api/v1/auth/login/');
