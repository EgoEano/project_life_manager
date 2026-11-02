import { useDatabaseBackup } from '../hooks';
import { View, StyleSheet, Platform } from 'react-native';
import { Button, Card, Text } from '../../../core/ui/components/interfaceComponents';
import { pickFile } from '../../../core/utils/files';
import { useLanguage } from '../../../core/services/providers/languageProviderService';
import { useNotification } from '../../../core/services/providers/notificationProvider';
import { useStyleAdapter, useStyleContext } from '../../../core/services/providers/styleProvider';
import { styles } from '../theme';


export function BackupSettings() {
    const { t } = useLanguage();
    const style = useStyleAdapter(styles);
    const { theme } = useStyleContext();

    const {
        handleExport,
        handleImport,
        handleDropDB,
        isExporting,
        isImporting,
        isDroping,
        exportProgress,
        importProgress,
        error
    } = useDatabaseBackup();
    const { pushDialog } = useNotification();


    function dialogUpload() {
        pushDialog({
            message: t("settings.uploadBackupConfirmation"),
            actions: [
                {
                    text: t("settings.upload"),
                    isResolve: true,
                    action: handleImportClick

                },
                {
                    text: t("cancel"),
                    isResolve: false
                },
            ]
        });
    }
    function dialogDrop() {
        pushDialog({
            message: t("settings.dropDBConfirmation"),
            actions: [
                {
                    text: t("settings.dropDBConfirm"),
                    isResolve: true,
                    action: handleDropDB

                },
                {
                    text: t("cancel"),
                    isResolve: false
                },
            ]
        })
    }
    async function handleImportClick() {
        const fileType = Platform.OS === 'web' ? 'json' : 'allFiles';
        const fileAsset = await pickFile(fileType);
        
        if (!fileAsset) return;
    
        await handleImport(fileAsset);
    };


    return (
        <Card style={style.rootBckp}>
            <Text>{t("settings.dataBackup")}</Text>
            
            {error && <Text colorVariant={"error"}>⚠️ {error}</Text>}

            <View style={style.areaBckp}>
                <Button 
                    onPress={handleExport} 
                    disabled={isExporting || isImporting}
                    title={t(
                        (isExporting ? "settings.exportBackupVarProgress" : "settings.downloadBackup"), 
                        { exportProgress }
                    )}
                />

                <Button 
                    onPress={dialogUpload} 
                    disabled={isExporting || isImporting}
                    title={t(
                        (isImporting ? "settings.importBackupVarProgress" : 'settings.uploadBackup'), 
                        { importProgress }
                    )}
                />

                <Button 
                    onPress={dialogDrop} 
                    disabled={isDroping}
                    title={t('settings.dropDB')}
                    style={{ text: style.deleteBtn }}
                />
            </View>

            {/* Progress bar */}
            {(isExporting || isImporting) && (
                <View style={style.progressAreaBckp}>
                    <View 
                        style={{ 
                            ...style.progressBarBckp,
                            width: `${isExporting ? exportProgress : importProgress}%`, 
                        }} 
                    />
                </View>
            )}
        </Card>
    );
};
