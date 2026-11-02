
export function arrayBufferToBase64(buffer: any): string {
    if (!buffer) return "";
    
    let bytes: Uint8Array;
    
    if (buffer instanceof Uint8Array) {
        bytes = buffer;

    } else if (buffer instanceof ArrayBuffer) {
        bytes = new Uint8Array(buffer);

    } else if (Array.isArray(buffer)) {
        bytes = new Uint8Array(buffer);

    } else if (buffer && buffer.byteLength !== undefined) {
        bytes = new Uint8Array(buffer.buffer || buffer);

    } else if (typeof buffer === 'object') { 
        bytes = new Uint8Array(Object.values(buffer));

    } else {
        return "";
    }

    if (bytes.length === 0) return "";

    let binary = "";

    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const len = binary.length;
  
    const bytes = new Uint8Array(len);
  
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
  
    return bytes.buffer;
}