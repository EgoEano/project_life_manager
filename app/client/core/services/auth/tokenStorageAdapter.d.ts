declare const TokenStorage: {
    checkAuth(): boolean;
    getExpiresAt(): number;
    setExpiresAt(expiresAt: number): boolean;

    getAccessToken(): string | null;
    setAccessToken(token: string): boolean;

    getRefreshToken(): Promise<string | null>;
    setRefreshToken(token: string): Promise<boolean>;

    clearTokens(): Promise<boolean>;
};

export default TokenStorage;
