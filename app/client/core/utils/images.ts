import { Asset, launchImageLibrary } from "react-native-image-picker";

export interface ImageAsset {
    base64: string;
    mimeType: string;
}

export async function pickImage(): Promise<ImageAsset | null> {
    const res = await launchImageLibrary({
      mediaType: "photo",
      includeBase64: true,
    });

    const asset = res.assets?.[0];
    if (!asset?.base64) return null;

    return {
        base64: asset.base64,
        mimeType: getMimeType(asset),
    };
}

export function getMimeType(asset: Asset): string {
    // 1. MIME from lib
    if (asset.type?.trim()) {
        return asset.type;
    }

    // 2. Filename
    const fileName = asset.fileName?.toLowerCase();

    if (fileName) {
        if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
            return 'image/jpeg';
        }

        if (fileName.endsWith('.png')) {
            return 'image/png';
        }

        if (fileName.endsWith('.webp')) {
            return 'image/webp';
        }

        if (fileName.endsWith('.gif')) {
            return 'image/gif';
        }

        if (fileName.endsWith('.bmp')) {
            return 'image/bmp';
        }

        if (fileName.endsWith('.heic')) {
            return 'image/heic';
        }

        if (fileName.endsWith('.heif')) {
            return 'image/heif';
        }
    }

    // 3. data:URL
    const mimeFromDataUri = asset.uri?.match(/^data:([^;]+);base64,/i)?.[1];

    if (mimeFromDataUri) {
        return mimeFromDataUri;
    }

    // 4. URI extention
    const uri = asset.uri?.toLowerCase();

    if (uri) {
        if (uri.endsWith('.jpg') || uri.endsWith('.jpeg')) {
            return 'image/jpeg';
        }

        if (uri.endsWith('.png')) {
            return 'image/png';
        }

        if (uri.endsWith('.webp')) {
            return 'image/webp';
        }

        if (uri.endsWith('.gif')) {
            return 'image/gif';
        }

        if (uri.endsWith('.heic')) {
            return 'image/heic';
        }
        
        if (uri.endsWith('.heif')) {
            return 'image/heif';
        }
    }

    // 5. Fallback
    console.warn('Unable to determine image MIME type, using image/jpeg', asset);

    return 'image/jpeg';
}