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
        // web plug: refresh token stored in secure cookie on server
        return null;
    },
    async setRefreshToken(_token: string): Promise<boolean> {
        // web plug: refresh token stored in secure cookie on server
        return true;
    },

    async clearTokens(): Promise<boolean> {
        accessToken = null;
        expiresAt = null;
        return true;
    },
};

export default TokenStorage;
