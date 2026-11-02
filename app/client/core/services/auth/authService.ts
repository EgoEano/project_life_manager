//#FIXME Platform возможно стоит убрать, но нужно разобраться куда поместить определение платформы
import { Platform } from 'react-native';
import TokenStorage from '../auth/tokenStorageAdapter';
import fetch from '../connection/fetchRequest';
import { logError } from '../utils/loggerService';
import getAppConfig, {buildConnectionString} from '../utils/appConfigHandler';

import type {
    FetchRequestOptions,
    FetchResponse,
} from '../connection/fetchRequest';
import type {
    AuthContextType,
    AuthLoginProps,
    AuthLoginRequest,
    AuthLoginResponse,
    AuthPayload,
    AuthRegisterClientProps,
    AuthRegisterRequest,
} from '../../types/auth';

//TODO Добавить логику логкального хранения

const isWebClient = Platform.OS === 'web';
const clientType = isWebClient ? 'web' : 'mobile';
let refreshPromise: Promise<boolean | null> | null = null;

async function validateLocalAuth(): Promise<boolean> {
    const hasAccess = TokenStorage.checkAuth();
    if (hasAccess) return true;

    //#FIXME Теряется payload - может стоить добавить локальное сохранение
    const refreshed = await refreshWithLock();
    return !!refreshed;
}

async function ensureAuth(): Promise<boolean> {
    const isValid = await validateLocalAuth();
    if (!isValid) await TokenStorage.clearTokens();
    return isValid;
}

async function login(payload: AuthLoginProps): Promise<AuthPayload> {
    const requestPayload: AuthLoginRequest = {
        ...payload,
        clientType,
    };

    const response = await fetch<AuthLoginResponse>({
        url: buildConnectionString(getAppConfig().authRoutes.login),
        method: 'POST',
        data: requestPayload,
    });

    if (!response.success) 
        throw new Error(response.error ?? 'login. Invalid credentials');

    const data = response.payload;
    const expiresAt = Number(data?.expires_at);
    if (!data?.access_token || !Number.isFinite(expiresAt))
        throw new Error('Invalid tokens');

    TokenStorage.setAccessToken(data.access_token);
    TokenStorage.setExpiresAt(Number(data.expires_at));

    if (!isWebClient && data?.refresh_token)
        await TokenStorage.setRefreshToken(data.refresh_token);

    return {
        id: data.user_id,
        login: payload.login
    };
}

async function register(payload: AuthRegisterClientProps): Promise<AuthPayload> {
    const { passwordRepeat, ...props } = payload;
    const requestPayload: AuthRegisterRequest = {
        ...props,
        clientType,
    };

    const response = await fetch<AuthLoginResponse>({
        url: buildConnectionString(getAppConfig().authRoutes.register),
        method: 'POST',
        data: requestPayload,
    });

    if (!response.success) 
        throw new Error(response.error ?? 'register. Invalid credentials');

    const data = response.payload;
    const expiresAt = Number(data?.expires_at);
    if (!data?.access_token || !Number.isFinite(expiresAt))
        throw new Error('Invalid tokens');

    TokenStorage.setAccessToken(data.access_token);
    TokenStorage.setExpiresAt(Number(data.expires_at));

    if (!isWebClient && data?.refresh_token)
        await TokenStorage.setRefreshToken(data.refresh_token);

    return {
        id: data.user_id,
        login: payload.login
    };
}

async function logout(): Promise<boolean> {
    if (!TokenStorage.checkAuth()) return false;
    try {
        const token = !isWebClient
            ? await TokenStorage.getRefreshToken()
            : null;
        const isCleared = await TokenStorage.clearTokens();

        const response = await fetch<unknown>({
            url: buildConnectionString(getAppConfig().authRoutes.logout),
            method: 'POST',
            data: !isWebClient ? token : undefined,
        });

        return isCleared && response.success;
    } catch (err) {
        logError('Logout error', err);
        return false;
    }
}

async function refresh(): Promise<boolean> {
    try {
        const token = !isWebClient
            ? await TokenStorage.getRefreshToken()
            : null;

        const requestPayload = {
            clientType,
            ...(!isWebClient ? { refresh_token: token } : {})
        };

        const response = await fetch<AuthLoginResponse>({
            url: buildConnectionString(getAppConfig().authRoutes.refresh),
            method: 'POST',
            data: requestPayload,
        });

        if (!response.success) 
            throw new Error(response.error ?? 'refresh. Invalid credentials');
    
        const data = response.payload;
        if (!data?.access_token || isNaN(Number(data.expires_at)))
            throw new Error('Invalid tokens');

        TokenStorage.setAccessToken(data.access_token);
        TokenStorage.setExpiresAt(Number(data.expires_at));

        if (!isWebClient && data?.refresh_token)
            await TokenStorage.setRefreshToken(data.refresh_token);

        return true;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function refreshWithLock(): Promise<boolean | null> {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            try {
                return await refresh();
            } finally {
                refreshPromise = null;
            }
        })();
    }

    return refreshPromise;
}

export async function authFetch<T>(
    options: FetchRequestOptions,
): Promise<FetchResponse<T>> {
    const buildHeaders = (token?: string | null) => {
        if (isWebClient) return { ...options.headers };

        return {
            ...options.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
    };

    try {
        // 1. First attempt
        const firstToken = TokenStorage.getAccessToken();
        const firstFetch = await fetch<T>({
            ...options,
            headers: buildHeaders(firstToken),
        });

        if (firstFetch.status !== 401) {
            return firstFetch;
        }

        // 2.1. Refresh process if access is expired
        let refreshed: boolean;
        try {
            refreshed = !!(await refreshWithLock());
        } catch {
            refreshed = false;
        }

        const newToken = TokenStorage.getAccessToken();
        if (!refreshed || !newToken) {
            await TokenStorage.clearTokens();
            return firstFetch;
        }

        // 2.2. Second attempt
        const secondFetch = await fetch<T>({
            ...options,
            headers: buildHeaders(newToken),
        });

        if (secondFetch.status === 401) {
            await TokenStorage.clearTokens();
        }

        return secondFetch;
    } catch (e) {
        return {
            success: false,
            status: 500,
            error: e instanceof Error ? e.message : 'NETWORK_ERROR',
            raw: {} as Response,
        };
    }
}

async function getMe(): Promise<any | null> {
    const response = await authFetch<any | null>({
        url: buildConnectionString(getAppConfig().authRoutes.me),
        method: 'GET',
    });
    if (!response.success || !response.payload) return null;
    return response.payload;
}

export default {
    authFetch,
    ensureAuth,
    login,
    logout,
    register,
    refresh: refreshWithLock,
    getMe,
} as AuthContextType;
