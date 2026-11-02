import FileTypes, { FileTypeKey, SelectedFileAsset } from "../types/file";


export function pickFile(type: FileTypeKey): Promise<SelectedFileAsset | null> {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';

        const chosenType = FileTypes[type];
        input.accept = Array.isArray(chosenType) ? chosenType.join(',') : String(chosenType);

        input.onchange = (event: Event) => {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (!file) {
                resolve(null);
                return;
            }

            const objectUrl = URL.createObjectURL(file);

            resolve({
                uri: objectUrl,
                name: file.name,
                mimeType: file.type || (Array.isArray(chosenType) ? chosenType[0] : String(chosenType)),
                size: file.size,
                fileObject: file // Сохраняем для сценариев отправки на бэкенд через FormData
            });
        };

        window.addEventListener('focus', () => {
            setTimeout(() => {
                if (!input.files?.length) resolve(null);
            }, 300);
        }, { once: true });

        input.click();
    });
}

export async function saveFile(input: string | Blob, fileName: string): Promise<void> {
    const url = typeof input === 'string' ? input : URL.createObjectURL(input);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export async function ensureDeleteFile(_path: string): Promise<boolean> {
    // Web does not have permission to delete files
    return true; 
}