import { DatabaseConfig, DBBackupOptions } from "../../types/types";


declare const DatabaseLocal: {
    init(config: DatabaseConfig): Promise<void>;

    isReady(): boolean;
    
    getAll<T, J>(
        collection: string, 
        filter: Partial<T>,
        ids?: (number | string)[] | null,
        primaryKey?: string
    ): Promise<J[]>;

    getById<T>(
        collection: string,
        id: number | string
    ): Promise<T | null>;

    insert<T>(
        collection: string,
        entity: T
    ): Promise<void>;

    update<T>(
        collection: string,
        id: number | string,
        updates: Partial<T>
    ): Promise<number>

    delete(
        collection: string,
        id: number | string
    ): Promise<void>;

    clear(collection: string): Promise<void>;

    export(options?: DBBackupOptions): Promise<Blob | string | undefined>;
    
    import(
        file: File | string,
        options?: DBBackupOptions
    ): Promise<boolean>;

    drop(): Promise<boolean>;
}

export default DatabaseLocal;