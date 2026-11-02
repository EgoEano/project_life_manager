import Dexie, { Collection } from "dexie";
import { exportDB, importInto } from 'dexie-export-import';
import { DatabaseConfig, DBBackupOptions } from "../../types/types";


let db: Dexie | null = null;
let _isInitialized = false;
let currentConfig: DatabaseConfig | null = null;


const ensureDb = (): Dexie => {
    if (!db || !_isInitialized) {
        throw new Error(
            "Database not initialized"
        );
    }

    return db;
};


const DatabaseLocal = {

    async init(config: DatabaseConfig) {
        try {
            if (db) {
                return;
            }

            currentConfig = config;

            const dexie = new Dexie(
                config.databaseName
            );

            const stores: Record<
                string,
                string
            > = {};

            for (const [name, table] of Object.entries(
                config.schema
            )) {
                stores[name] = [
                    table.primaryKey,
                    ...(table.indexes ?? [])
                ].join(",");
            }

            dexie
                .version(config.version ?? 1)
                .stores(stores);

            if (config.seedData) {
                dexie.on('populate', (tx) => {
                    for (const [tableName, records] of Object.entries(config.seedData!)) {
                        tx.table(tableName).bulkAdd(records);
                    }
                });
            }

            await dexie.open();

            db = dexie;
            _isInitialized = true;
        } catch (e) {
            console.error(e);
            throw new Error("Dexie init error");
        }
    },

    isReady(): boolean {
        return _isInitialized;
    },

    async getAll<T, J>(
        collection: string,
        filter: Partial<T> = {},
        ids?: (number | string)[] | null,
        primaryKey?: string
    ): Promise<J[]> {
        try {
            if (ids && ids.length === 0) return [];

            const db = ensureDb();
            const table = db.table(collection);
            
            let query: Collection<any, any> = ids
            ? table.where(primaryKey ?? table.schema.primKey.name).anyOf(ids)
            : table.toCollection();

            if (Object.keys(filter).length > 0) {
                query = query.filter(item =>
                    Object.entries(filter).every(
                        ([key, value]) => item[key] === value
                    )
                );
            }
        
            return query.toArray() as Promise<J[]>;
        } catch (e) {
            console.error(e);
            throw new Error(`Dexie get all error: ${e}`);
        }
    },

    async getById<T>(
        collection: string,
        id: string | number
    ): Promise<T | null> {
        try {
            const result =
                await ensureDb()
                    .table(collection)
                    .get(id);

            return result ?? null;
        } catch (e) {
            console.error(e);
            throw new Error(`Dexie get error: ${e}`);
        }
    },

    async insert<T>(
        collection: string,
        entity: T
    ) {
        try {
            await ensureDb()
                .table(collection)
                .add(entity);
        } catch (e) {
            console.error(e);
            throw new Error(`Dexie insert error: ${e}`);
        }
    },

    async update<T>(
        collection: string,
        id: string | number,
        updates: Partial<T>
    ): Promise<number> {
        try {
            return await ensureDb()
                .table(collection)
                .update(id, updates);
        } catch (e) {
            console.error(e);
            throw new Error(`Dexie updating error: ${e}`);
        }
    },

    async delete(
        collection: string,
        id: string | number
    ) {
        try {
            await ensureDb()
                .table(collection)
                .delete(id);
        } catch (e) {
            console.error(e);
            throw new Error(`Dexie deletion error: ${e}`);
        }
    },

    async clear(
        collection: string
    ) {
        try {
            await ensureDb()
                .table(collection)
                .clear();
        } catch (e) {
            console.error(e);
            throw new Error(`Dexie error: ${e}`);
        }
    },

    async export(options?: DBBackupOptions): Promise<Blob | undefined> {
        try {
            if (!db) return;

            const blob = await exportDB(db, {
                numRowsPerChunk: 50,
                prettyJson: false,
                progressCallback: (progress) => {
                    if (options?.onProgress && progress.totalRows) {
                        const perc = Math.round(
                            (progress.completedRows / progress.totalRows) * 100
                        );
                        options.onProgress(perc);
                    }
                    return true;
                }
            });
            return blob;

        } catch (e) {
            console.error(e);
            throw new Error(`Dexie export error: ${e}`);
        }
    },

    async import(
        file: File | string,
        options?: DBBackupOptions
    ): Promise<boolean> {
        if (!file || !db || !(file instanceof File)) return false;

        try {
            if (!db.isOpen()) await db.open();

            await importInto(db, file, {
                overwriteValues: true,
                clearTablesBeforeImport: false,
                acceptVersionDiff: true,
                acceptMissingTables: true,
                progressCallback: (progress) => {
                    if (options?.onProgress && progress.totalRows) {
                        const perc = Math.round(
                            (progress.completedRows / progress.totalRows) * 100
                        );
                        options.onProgress(perc);
                    }
                    return true;
                }
            });

            return true;
        } catch (e) {
            console.error(e);
            throw new Error(`Dexie import error: ${e}`);
        }
    },

    async drop(): Promise<boolean> {
        let currDB: Dexie | null = ensureDb();

        return await currDB.delete()
            .then(() => {
                db = null;
                _isInitialized = false;
                currDB = null;

                return true;
            })
            .catch((err) => {
                console.error("Ошибка при удалении базы данных:", err);
                return false;
            });
    }
};

export default DatabaseLocal;