import {
    FetchRequestOptions,
    FetchResponse,
} from '../services/connection/fetchRequest';


export interface AuthLoginProps {
    login: string;
    password: string;
}
export interface AuthLoginClientProps extends AuthLoginProps {};

export interface AuthRefreshProps {
    refresh_token: string
}
export interface AuthRefreshClientProps extends AuthRefreshProps {};

export interface AuthRegisterProps {
    login: string;
    password: string;
}
export interface AuthRegisterClientProps extends AuthRegisterProps {
    passwordRepeat: string;
}

export interface AuthLoginRequest extends AuthLoginProps {
    clientType: 'web' | 'mobile';
}

export interface AuthRegisterRequest extends AuthRegisterProps {
    clientType: 'web' | 'mobile';
}

export type AuthPayload = {
    id: string;
    login: string;
};

export type AuthLoginResponse = {
    user_id: string;
    access_token: string;
    refresh_token?: string | null;
    session_id: string;
    expires_at: number;
};

export type AuthContextType = {
    authFetch: <T>(options: FetchRequestOptions) => Promise<FetchResponse<T>>;
    ensureAuth: () => Promise<boolean>;
    login: (
        payload: Omit<AuthLoginProps, 'clientType'>,
    ) => Promise<AuthPayload | null>;
    logout: () => Promise<boolean>;
    register: (
        payload: Omit<AuthRegisterProps, 'clientType'>,
    ) => Promise<AuthPayload | null>;
    refresh: () => Promise<AuthPayload | null>;
    getMe: () => Promise<AuthPayload | null>;
};

export interface AuthRoutes {
    login: string;
    logout: string;
    refresh: string;
}

// redux
export type AuthSliceStatus = 'unknown' | 'authorized' | 'unauthorized';

export interface AuthSliceState {
    status: AuthSliceStatus;
    user: AuthPayload | null;
    isLoading: boolean;
    isAuthChecked: boolean;
    error: string | null;
}
