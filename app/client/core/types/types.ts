import type React from 'react';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { LanguagesMap } from './language';
import { ThemeContainer } from './theme';

declare global {
    interface Window {
        root: import('react-dom/client').Root;
    }
}

export type RouteNode = {
    path: string;
    serverBasePath?: string; // Use only in appRoot node for server base name
    name: string; // Optional: explicit mobile screen name (auto-generated if not provided)
    component?: React.ComponentType<unknown>;
    children?: RouteNode[];
    optionsNavigator?: NavigatorOptions;
    options?: RouteNodeOptions;
};

export type RouteNodeOptions = {
    headerShown?: boolean;
    navTreeShown?: boolean;
}

export type RouteNodePath = {
    path: string;
    name: string;
    children?: RouteNodePath[];
    options: RouteNodeOptions | null;
}

export type StackType = 'stack' | 'tabs' | 'drawer' | null | undefined;
export type NavigatorOptions = {
    type: StackType;
    options: NativeStackNavigationOptions;
};

export type Option = {
    key: string;
    value: string;
};

// DB
export type DBColumnTypes = "TEXT" | "INTEGER" | "REAL" | "BLOB";
export interface CollectionDatabaseSchema {
    primaryKey: string;
    indexes: string[];
    columns: Record<string, DBColumnTypes>
}
export interface DatabaseSchema {
    [collection: string]: CollectionDatabaseSchema;
}
export type DBConfigSeedData = Record<string, any[]>;
export interface DatabaseConfig {
    databaseName: string;
    version?: number;
    schema: DatabaseSchema;
    seedData?:  DBConfigSeedData;
}
export interface DBBackupOptions {
    onProgress?: (progress: number) => void;
}
export type RefItem = {
    id: number;
    label: string;
    [key: string]: string | number;
}
export type RefItemForm = RefItem & { mode: "create" | "edit" | "delete" };

// Bootstrap
export interface AppModuleBootstrap {
    moduleConfig: ModuleConfig;
    default: () => void | Promise<void>;
}
export type ModuleDBSchemaBlock = Record<string, CollectionDatabaseSchema>
export interface ModuleConfig {
    store: {
        db: {
            isNeedInitDB: boolean;
            schema: ModuleDBSchemaBlock | null;
            seed?:  DBConfigSeedData;
        }
    },
    language: LanguagesMap;
    themes: ThemeContainer | null;
}