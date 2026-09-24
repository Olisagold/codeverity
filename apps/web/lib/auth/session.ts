

export const ACCESS_TOKEN_COOKIE = 'cv_access_token';
export const REFRESH_TOKEN_COOKIE = 'cv_refresh_token';


export const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
