import * as DocumentPicker from '@react-native-documents/picker';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { Platform, Share } from 'react-native';
import { FileTypeKey, SelectedFileAsset } from '../types/file';

export async function pickFile(type: FileTypeKey): Promise<SelectedFileAsset | null> {
    try {
        const chosenType = DocumentPicker.types[type];
        const typeArray = Array.isArray(chosenType) ? chosenType : [chosenType];


        const [res] = await DocumentPicker.pick({
            type: typeArray,
        });

        if (!res || !res.uri) return null;

        const originalUri = res.uri; 
        const fileName = res.name || `file.${type}`;
        const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

        await RNFS.copyFile(originalUri, destPath);

        return {
            uri: `file://${destPath}`,
            name: fileName,
            mimeType: res.type || String(typeArray[0]),
            size: res.size ?? undefined,
        };

    } catch (err: any) {
        if (DocumentPicker.isErrorWithCode(err) && err.code === DocumentPicker.errorCodes.OPERATION_CANCELED) return null;

        console.error("File select error:", err);
        return null;
    }
}

export async function saveFile(input: string, fileName: string): Promise<void> {
    try {
        if (!input) throw new Error("Source URI is empty");
        
        if (Platform.OS === 'android') {
            try {
                const fileUri = input.startsWith('file://') ? input : `file://${input}`;

                await DocumentPicker.saveDocuments({
                    sourceUris: [fileUri],
                    fileName: fileName,
                    mimeType: 'application/octet-stream'
                });

                await ensureDeleteFile(input);

                // const directory = await DocumentPicker.pickDirectory();
                
                // if (!directory || !directory.uri) return;
        
                // const targetDirectoryUri = decodeURIComponent(directory.uri);
                // const finalSavePath = `${targetDirectoryUri}/${fileName}`;
        
                // if (await RNFS.exists(finalSavePath)) {
                //     await RNFS.unlink(finalSavePath);
                // }
        
                // await RNFS.copyFile(input, finalSavePath);
                
                // await RNFS.unlink(input).catch(() => {});
        
            } catch (err) {
                if (DocumentPicker.isErrorWithCode(err) && err.code === DocumentPicker.errorCodes.OPERATION_CANCELED) {
                    return; 
                }
                throw err;
            }
            
        } 
        
        else if (Platform.OS === 'ios') {
            const tempPath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
            
            await ensureDeleteFile(tempPath);
            
            await RNFS.copyFile(input, tempPath);
            
            await Share.share({
                url: tempPath,
                title: fileName
            });
            
            setTimeout(() => ensureDeleteFile(tempPath), 5000);
        }
    } catch (error) {
        console.error("Ошибка сохранения файла на мобильной платформе:", error);
        throw error;
    }
}

export async function ensureDeleteFile(path: string): Promise<boolean> {
    try {
        if (await RNFS.exists(path)) await RNFS.unlink(path);
        return true;
    } catch (e: any) {
        console.error(e);
        return false
    }
}