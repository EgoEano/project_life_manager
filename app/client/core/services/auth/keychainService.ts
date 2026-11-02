import Keychain from 'react-native-keychain';
import { logError, logWarn } from '../utils/loggerService';

export const SecurityLevels = {
    LOW: {
        accessControl: undefined,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        authenticationPrompt: undefined,
        description:
            'Basic protection, data is accessible when the device is unlocked',
    },

    MEDIUM: {
        accessControl: Keychain.ACCESS_CONTROL.USER_PRESENCE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        authenticationPrompt: {
            title: 'Confirm identity',
            subtitle: 'To access encrypted data',
            description: 'Use fingerprint, Face ID, or device password',
            cancel: 'Cancel',
        },
        description:
            'Requires user authentication; not bound to a specific fingerprint',
    },

    HIGH: {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        authenticationPrompt: {
            title: 'Confirm biometrics',
            subtitle: 'Accessible only for current biometrics',
            description:
                'If biometrics change, the data will become inaccessible',
            cancel: 'Cancel',
        },
        description:
            'Tied to the current set of biometrics (maximum protection)',
    },
} as const;

export type SecurityLevelKey = keyof typeof SecurityLevels;

export async function saveSecret<T>(
    key: string,
    value: T,
    level: SecurityLevelKey = 'MEDIUM',
): Promise<boolean | null> {
    try {
        const options = SecurityLevels[level];
        const set = await Keychain.setGenericPassword(
            'meta',
            JSON.stringify(value),
            {
                service: `app.${key}`,
                ...options,
            },
        );
        return !!set;
    } catch (e) {
        logError(`[Keychain] Failed to save secret for "${key}":`, e);
        return null;
    }
}

export async function loadSecret<T = any>(key: string): Promise<T | null> {
    try {
        const result = await Keychain.getGenericPassword({
            service: `app.${key}`,
        });
        if (!result) return null;

        try {
            return JSON.parse(result.password) as T;
        } catch {
            logWarn(`[Keychain] Corrupted data for "${key}"`);
            return null;
        }
    } catch (e) {
        logError('Failed to load secret:', e);
        return null;
    }
}

export async function deleteSecret(key: string): Promise<boolean | null> {
    try {
        const del = await Keychain.resetGenericPassword({
            service: `app.${key}`,
        });
        return !!del;
    } catch (e) {
        logError(`[Keychain] Failed to delete secret for "${key}":`, e);
        return null;
    }
}
