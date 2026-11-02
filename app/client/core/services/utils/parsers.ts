import { Buffer } from 'buffer';

import type { Option } from '../../types/types';

export function parseBase64(base64: string) {
    return Buffer.from(base64, 'base64').toString('utf8');
}

export function decodeJwt(token: string) {
    if (!token || typeof token !== 'string' || token.length == 0) return null;
    const [, payload] = token.split('.');
    if (!payload || payload.length == 0) return null;
    const json = parseBase64(payload);
    return JSON.parse(json);
}

export const toInputValue = (v: unknown): string => v != null ? String(v) : '';

export function createOptions<T>({
    source,
    isNullable = false,
    key,
    value,
}: {
    source: T[];
    isNullable?: boolean;
    key: keyof T;
    value: keyof T;
}): Option[] {
    const opt: Option[] = source.map((item) => ({
        key: String(item[key]),
        value: String(item[value]),
    }));

    if (isNullable) opt.unshift({key: "", value: ""});
    
    return opt;
}