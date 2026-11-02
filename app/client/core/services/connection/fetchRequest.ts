interface FetchOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    headers?: Record<string, string>;
    body?: string | FormData;
    credentials?: 'omit' | 'same-origin' | 'include';
    signal?: AbortSignal;
}

export interface FetchRequestOptions {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    data?: unknown;
    headers?: Record<string, string>;
    timeout?: number;
    credentials?: 'omit' | 'same-origin' | 'include';
    cache?:
        | 'default'
        | 'no-store'
        | 'reload'
        | 'no-cache'
        | 'force-cache'
        | 'only-if-cached';
    redirect?: 'follow' | 'error' | 'manual';
}

export interface FetchResponseSuccess<T> {
    success: true;
    payload: T;

    status: number;
    raw: Response;
}
export interface FetchResponseError<T> {
    success: false;
    error: string;

    status: number;
    raw: Response;
}
export type FetchResponse<T> = FetchResponseSuccess<T> | FetchResponseError<T>;

const isAbortError = (err: unknown) => {
    if (!err) return false;

    if (typeof err !== 'object') return false;

    const e = err as any;

    return (
        e?.name === 'AbortError' ||
        e?.code === 20 || // RN polyfills sometimes
        String(e?.message)?.toLowerCase().includes('aborted')
    );
};

// function buildFetchResponse<T>(props: Partial<FetchResponse<T>>): FetchResponse<T> {
// }

//TODO Добавить стрингификацию данных при json, и доп дженерик тип для Request body
export default async function fetchRequest<T = unknown>({
    url,
    method = 'POST',
    data,
    headers = {},
    timeout = 10000,
    credentials = 'include',
    cache = 'no-store',
    redirect = 'follow',
}: FetchRequestOptions): Promise<FetchResponse<T>> {
    if (!url.trim()) {
        return {
            success: false,
            status: 0,
            error: 'URL is required',
            raw: {} as Response,
        };
    }

    const controller = new AbortController();
    const signal = controller.signal;
    const timer = setTimeout(() => controller.abort(), timeout);

    let requestUrl = url;
    const fetchOptions: FetchOptions = { method, headers, signal, credentials };
    
    // GET/HEAD
    if (
        (method === 'GET' || method === 'HEAD') &&
        data &&
        typeof data === 'object'
    ) {
        const query = new URLSearchParams(
            data as Record<string, string>,
        ).toString();
        if (query) requestUrl += (requestUrl.includes('?') ? '&' : '?') + query;
    
    // POST/PUT/...
    } else if (data) {
        if (data instanceof FormData) {
            fetchOptions.body = data;
        } else {
            fetchOptions.body = JSON.stringify(data);
            fetchOptions.headers = {
                'Content-Type': 'application/json',
                ...headers,
            };
        }
    }

    try {
        const response = await fetch(requestUrl, {
            ...fetchOptions,
            cache,
            redirect,
        });
        clearTimeout(timer);

        let responseData: T | string | Blob | undefined;
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            responseData = await response.json();
        } else if (
            contentType.startsWith('text/') ||
            contentType.includes('xml')
        ) {
            responseData = await response.text();
        } else {
            responseData = await response.blob();
        }

        if (!response.ok) {
            return {
                success: false,
                status: response.status,
                error: response.statusText,
                raw: response,
            };
        }

        return {
            success: true,
            status: response.status,
            payload: responseData as T,
            raw: response,
        };
    } catch (err) {
        clearTimeout(timer);

        if (isAbortError(err)) {
            return {
                success: false,
                status: 0,
                error: 'ABORTED',
                raw: {} as Response,
            };
        }
            
        return {
            success: false,
            status: 0,
            error: err instanceof Error ? err.message : 'Unknown error',
            raw: {} as Response,
        };
    }
}
