import storage from './storageAdapter';
import { logError } from '../utils/loggerService';

type StorageType = {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
};

const Storage: StorageType = {
    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await storage.getItem(key);
            return value ? (JSON.parse(value) as T) : null;
        } catch (e) {
            logError('Storage error', e);
            return null;
        }
    },

    async set<T>(key: string, value: T): Promise<void> {
        try {
            await storage.setItem(key, JSON.stringify(value));
        } catch (e) {
            logError('Storage error', e);
        }
    },

    async remove(key: string): Promise<void> {
        try {
            await storage.removeItem(key);
        } catch (e) {
            logError('Storage error', e);
        }
    },
};

export default Storage;
