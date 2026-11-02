import { saveSecret, loadSecret, deleteSecret } from './keychainService';

//#FIXME Токен хранится только по одному ключу "refresh_token" на всех
// Нужно подумать разделение по ключам
const REFRESH_TOKEN_KEY = 'refresh_token';
let accessToken: string | null = null;
let expiresAt: number | null = null;

const TokenStorage = {
    checkAuth(): boolean {
        if (!accessToken) return false;
        if (!expiresAt) return false;
        if (expiresAt - 30 * 1000 < Date.now()) return false;
        return true;
    },
    getExpiresAt(): number | null {
        return expiresAt;
    },
    setExpiresAt(newExpiresAt: number): boolean {
        expiresAt = newExpiresAt;
        return true;
    },

    getAccessToken(): string | null {
        return accessToken;
    },
    setAccessToken(token: string): boolean {
        accessToken = token;
        return true;
    },

    async getRefreshToken(): Promise<string | null> {
        return await loadSecret<string>(REFRESH_TOKEN_KEY);
    },
    async setRefreshToken(token: string): Promise<boolean> {
        const result = await saveSecret(REFRESH_TOKEN_KEY, token);
        return result === true;
    },

    async clearTokens(): Promise<boolean> {
        accessToken = null;
        expiresAt = null;
        const result = await deleteSecret(REFRESH_TOKEN_KEY);
        return result === true;
    },
};

export default TokenStorage;
