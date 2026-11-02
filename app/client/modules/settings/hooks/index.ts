import { useState, useCallback } from 'react';
import databaseService from '../../../core/services/storage/dbAdapter'; 
import getAppConfig from '../../../core/services/utils/appConfigHandler';
import { Navigator } from '../../../core/services/navigation/navigationService';
import { ensureDeleteFile, saveFile } from '../../../core/utils/files';
import { Platform } from 'react-native';
import { SelectedFileAsset } from '../../../core/types/file';


export function useDatabaseBackup() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isDroping, setIsDroping] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [importProgress, setImportProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleExport = useCallback(async () => {
        setIsExporting(true);
        setExportProgress(0);
        setError(null);

        try {
            const exportData = await databaseService.export({
                onProgress: (progress) => setExportProgress(progress)
            });

            if (!exportData) {
                throw new Error("DB is not initialized");
            }

            const date = new Date().toISOString().slice(0, 10);
            const fileExtension = Platform.OS === 'web' ? 'json' : 'db';
            const fileName = `${getAppConfig().name}_backup_${date}.${fileExtension}`;

            await saveFile(exportData, fileName);

        } catch (err: any) {
            setError(err.message || "DB export error");
        } finally {
            setIsExporting(false);
        }
    }, []);

    const handleImport = useCallback(async (file: SelectedFileAsset) => {
        if (!file) return;
        
        setIsImporting(true);
        setImportProgress(0);
        setError(null);


        let success = false;
        try {
            if (Platform.OS === 'web') {
                const fileObject = file.fileObject;
                if (!fileObject) throw new Error("Web. File is not found");

                success = await databaseService.import(fileObject, {
                    onProgress: (progress) => setImportProgress(progress)
                });

            } else {
                const uri = file.uri;
                if (!uri) throw new Error("Native. File uri is not found");

                success = await databaseService.import(uri, {
                    onProgress: (progress) => setImportProgress(progress)
                });
            }

        } catch (err: any) {
            setError(err.message || "DB import error");
            setIsImporting(false);

        } finally {
            if (Platform.OS !== 'web' && file.uri) {
                try {
                    const filePath = file.uri.replace('file://', '');
                    const isDeleted = await ensureDeleteFile(filePath);
                    if (!isDeleted) {
                        console.warn("Temp file was not deleted");
                    }
                } catch (cleanUpError) {
                    console.error("Deletion failed:", cleanUpError);
                }
            }
        } 

        if (success) Navigator.exitApp();
    }, []);

    const handleDropDB = useCallback(async () => {
        setIsDroping(true);
        setError(null);

        try {
            const success = await databaseService.drop();

            if (success) {
                Navigator.exitApp();
            } else {
                throw new Error("Import failed");
            }
        } catch (err: any) {
            setError(err.message || "DB import error");
            setIsDroping(false);
        }
    }, []);

    return {
        handleExport,
        handleImport,
        handleDropDB,
        isExporting,
        isImporting,
        isDroping,
        exportProgress,
        importProgress,
        error,
        clearError: () => setError(null)
    };
}
