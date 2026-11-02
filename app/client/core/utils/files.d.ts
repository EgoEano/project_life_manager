import { FileTypeKey, SelectedFileAsset } from "../types/file";

declare function pickFile(type: FileTypeKey): Promise<SelectedFileAsset | null>;
declare function saveFile(input: string | Blob, fileName: string): Promise<void>;
declare function ensureDeleteFile(path: string): Promise<boolean>;