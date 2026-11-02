import { open, DB } from '@op-engineering/op-sqlite';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { DatabaseConfig, DBBackupOptions } from "../../types/types";
import { Buffer } from 'buffer';
import { ensureDeleteFile } from '../../utils/files.native';


let db: DB | null = null;
let _isInitialized = false;
let currentConfig: DatabaseConfig | null = null;


const ensureDb = (): DB => {
    if (!db || !_isInitialized) {
        throw new Error("Database not initialized");
    }
    return db;
};


const DatabaseLocal = {
    async init(config: DatabaseConfig): Promise<void> {
        try {
            if (db) return;

            currentConfig = config;
            const dbFileName = `${config.databaseName || 'local_db'}.db`;

            db = open({
                name: dbFileName,
            });

            for (const [tableName, tableConfig] of Object.entries(config.schema)) {
                const indexes = tableConfig.indexes ?? [];

                const definedColumns = tableConfig.columns;

                const columnDefinitions: string[] = ["id INTEGER PRIMARY KEY AUTOINCREMENT"];

                if (definedColumns) {
                    Object.entries(definedColumns).forEach(([colName, colType]) => {
                        if (colName !== 'id') {
                            columnDefinitions.push(`"${colName}" ${colType}`);
                        }
                    });
                } else {
                    indexes.forEach(idx => {
                        if (idx !== 'id') {
                            columnDefinitions.push(`"${idx}" TEXT`);
                        }
                    });
                }

                const columnsSetup = columnDefinitions.join(", ");


                await db.execute(`CREATE TABLE IF NOT EXISTS "${tableName}" (${columnsSetup});`);

                for (const idx of indexes) {
                    await db.execute(`CREATE INDEX IF NOT EXISTS "idx_${tableName}_${idx}" ON "${tableName}" ("${idx}");`);
                }
            }

            // Checking that Seed is needed
            if (config.seedData) {
                let isDbEmpty = true;
                
                for (const tableName of Object.keys(config.seedData)) {
                    const result = await db.execute(`SELECT COUNT(*) as count FROM "${tableName}"`);
                    const countRow = result.rows?.[0] as Record<string, unknown> | undefined;

                    if (countRow && typeof countRow.count === 'number' && countRow.count > 0) {
                        isDbEmpty = false;
                        break;
                    }
                }

                if (isDbEmpty) {
                    for (const [tableName, records] of Object.entries(config.seedData)) {
                        const tableConfig = config.schema[tableName];

                        const allowedColumns = tableConfig.columns
                            ?? Object.fromEntries((tableConfig?.indexes ?? []).map(idx => [idx, "TEXT"]));

                        await db.transaction(async (tx) => {
                            for (const record of records) {
                                const serialized = serializeEntity(record, allowedColumns);
                                const keys = Object.keys(serialized);
                                const placeholders = keys.map(() => "?").join(", ");
                                const values = Object.values(serialized) as (string | number | null)[];

                                await tx.execute(
                                    `INSERT INTO "${tableName}" (${keys.map(k => `"${k}"`).join(", ")}) VALUES (${placeholders})`,
                                    values
                                );
                            }
                        });
                    }
                }
            }

            _isInitialized = true;
        } catch (e) {
            console.error("Ошибка инициализации op-sqlite:", e);
            throw new Error("Native SQLite error during initialization");
        }
    },

    isReady(): boolean {
        return _isInitialized;
    },

    async getAll<T, J>(
        collection: string,
        filter: Partial<T>,
        ids?: (number | string)[],
        primaryKey?: string //#FIXME Добавить применение primaryKey
    ): Promise<J[]> {
        try {
            const activeDb = ensureDb();
            let query = `SELECT * FROM "${collection}"`;
            const conditions: string[] = [];
            const params: any[] = [];

            if (ids) {
                if (ids.length === 0) return [];
                const placeholders = ids.map(() => "?").join(", ");
                conditions.push(`id IN (${placeholders})`);
                params.push(...ids);
            }

            if (Object.keys(filter).length > 0) {
                for (const [key, value] of Object.entries(filter)) {
                    conditions.push(`"${key}" = ?`);
                    params.push(value);
                }
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(" AND ")}`;
            }

            const result = await activeDb.execute(query, params);
            const rows = result.rows ?? [];

            return rows.map(row => parseRow<J>(row)) as J[];
        } catch (e) {
            console.error(`Ошибка getAll в коллекции ${collection}:`, e);
            throw e;
        }
    },

    async getById<T>(
        collection: string,
        id: string | number
    ): Promise<T | null> {
        try {
            const activeDb = ensureDb();
            const result = await activeDb.execute(`SELECT * FROM "${collection}" WHERE id = ? LIMIT 1`, [id]);
            const row = result.rows?.[0];
            
            if (!row) return null;

            return parseRow<T>(row);
        } catch (e) {
            console.error(`Ошибка getById в коллекции ${collection}:`, e);
            throw e;
        }
    },

    async insert<T extends Record<string, unknown>>(
        collection: string,
        entity: T
    ): Promise<void> {
        try {
            const activeDb = ensureDb();
            const tableConfig = currentConfig?.schema[collection];

            const definedColumns = tableConfig?.columns
                || Object.fromEntries((tableConfig?.indexes ?? []).map(idx => [idx, "TEXT"]));

            const serialized = serializeEntity<T>(entity, definedColumns);
            const keys = Object.keys(serialized);
            const placeholders = keys.map(() => "?").join(", ");
            const values = Object.values(serialized) as (string | number | null)[];

            await activeDb.execute(
                `INSERT INTO "${collection}" (${keys.map(k => `"${k}"`).join(", ")}) VALUES (${placeholders})`,
                values
            );
        } catch (e) {
            console.error(`Ошибка insert в коллекцию ${collection}:`, e);
            throw e;
        }
    },

    async update<T extends Record<string, unknown>>(
        collection: string,
        id: string,
        updates: Partial<T>
    ): Promise<number> {
        try {
            const activeDb = ensureDb();
            
            const tableConfig = currentConfig?.schema[collection];
            const definedColumns = tableConfig?.columns;
            const indexes = tableConfig?.indexes ?? [];
            
            const allowedColumns = definedColumns ? Object.keys(definedColumns) : [...indexes];

            const validUpdates: Record<string, unknown> = {};
            Object.entries(updates).forEach(([key, value]) => {
                if (allowedColumns.includes(key) && key !== 'id') {
                    validUpdates[key] = value;
                }
            });

            const serialized = serializeEntity<any>(validUpdates, definedColumns || {});

            const keys = Object.keys(serialized);
            if (keys.length === 0) return 0;

            const setStatement = keys.map(k => `"${k}" = ?`).join(", ");
            const values = Object.values(serialized) as (string | number | null)[];
            
            values.push(id as string | number | null);

            const result = await activeDb.execute(
                `UPDATE "${collection}" SET ${setStatement} WHERE id = ?`,
                values
            );

            return result.rowsAffected ?? 0;

        } catch (e) {
            console.error(`Ошибка update в коллекции ${collection}:`, e);
            throw e;
        }
    },

    async delete(
        collection: string,
        id: string | number
    ): Promise<void> {
        try {
            const activeDb = ensureDb();
            
            await activeDb.execute(`DELETE FROM "${collection}" WHERE id = ?`, [id as string | number | null]);
        } catch (e) {
            console.error(`Ошибка delete в коллекции ${collection}:`, e);
            throw e;
        }
    },

    async clear(
        collection: string
    ): Promise<void> {
        try {
            const activeDb = ensureDb();
            await activeDb.execute(`DELETE FROM "${collection}"`);
            await activeDb.execute(`DELETE FROM sqlite_sequence WHERE name = ?`, [collection]);
        } catch (e) {
            console.error(`Ошибка clear в коллекции ${collection}:`, e);
            throw e;
        }
    },

    async export(options?: DBBackupOptions): Promise<string | undefined> {
        let destPath: string | null = null;
        try {
            if (!db) return undefined;

            const dbDir = db.getDbPath(); 
            
            const backupFileName = `backup_${Date.now()}.db`;
            const destPath = `${RNFS.TemporaryDirectoryPath}/${backupFileName}`;

            await RNFS.copyFile(dbDir, destPath);

            if (options?.onProgress) {
                options.onProgress(100); 
            }

            return destPath;

        } catch (e) {
            console.error("Ошибка экспорта базы данных:", e);

            if (destPath && await RNFS.exists(destPath)) {
                await RNFS.unlink(destPath).catch(() => {});
            }

            throw new Error("Native SQLite export error");
        }
    },


    async import(
        file: File | string,
        options?: DBBackupOptions
    ): Promise<boolean> {
        try {
            if (!db || !file || typeof file !== 'string') return false;

            const cleanSrcPath = file.replace('file://', '');
            const currentPath = (await db.getDbPath()).replace('file://', '');

            
            db.close();
            _isInitialized = false;
            db = null;

            await ensureDeleteFile(currentPath);
            await RNFS.copyFile(cleanSrcPath, currentPath);

            if (options?.onProgress) {
                options.onProgress(100);
            }

            if (currentConfig) {
                await this.init(currentConfig);
            }

            return true;
        } catch (e) {
            console.error("Ошибка импорта базы данных:", e);
            throw new Error("Native SQLite import error");
        }
    },


    async drop(): Promise<boolean> {
        try {
            if (!db) return false;

            const currentPath = db.getDbPath();
            db.close();

            if (RNFS && await RNFS.exists(currentPath)) {
                await RNFS.unlink(currentPath);
            }
            db = null;
            _isInitialized = false;
            return true;
        } catch (err) {
            console.error("Ошибка при полном удалении базы данных:", err);
            return false;
        }
    },
};

function serializeEntity<T extends Record<string, unknown>>(
    entity: T, 
    definedColumns: Record<string, string>
): Record<string, unknown> {
    const record: Record<string, unknown> = {};
    const allowedColumns = Object.keys(definedColumns);


    allowedColumns.forEach(key => {
        if (key === 'id') return;

        if (key in entity) {
            const value = entity[key];
            const columnType = definedColumns[key];
            
            if (columnType === 'TEXT' && value !== null && typeof value === 'object') {
                record[key] = JSON.stringify(value);
            } else {
                // Числа, строки и Uint8Array (для BLOB) уходят в SQLite без изменений
                record[key] = value;
            }
        } else {
            // Если поле не передано, пишем NULL
            // Протестировать удобно ли такое поведение
            record[key] = null;
        }
    });

    // ID autoincrement or straight
    if ('id' in entity) {
        record['id'] = entity['id'];
    }

    return record;
};

function deserializeRow<T>(
    row: Record<string, unknown>
): T {
    try {
        const { _json_data, ...indexedFields } = row;
        const parsedJson = typeof _json_data === 'string' ? JSON.parse(_json_data) : {};
        
        return {
            ...indexedFields,
            ...parsedJson
        } as T;
    } catch (e) {
        console.error("Ошибка десериализации строки базы данных:", e);
        return row as unknown as T;
    }
};

function parseRow<T>(
    row: Record<string, unknown> | undefined
): T | null {
    if (!row) return null;

    const result = { ...row };

    Object.keys(result).forEach(key => {
        const value = result[key];

        if (typeof value === 'string') {
            const trimmed = value.trim();
            if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || 
                (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
                try {
                    result[key] = JSON.parse(value);
                } catch (e) {
                    // Если это оказалась обычная строка, оставляем как есть
                }
            }
        }
    });

    return result as T;
};

export default DatabaseLocal;