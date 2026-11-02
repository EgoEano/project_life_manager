//import 'react-native-get-random-values';
//import { v4 as uuidv4 } from 'uuid';

// export function generateUUID(): string {
//     return uuidv4();
// }

// export function generateRandomString(length: number, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
//     let result = '';
//     const array = new Uint32Array(length);
//     crypto.getRandomValues(array);
//     for (let i = 0; i < length; i++) {
//         result += chars[array[i] % chars.length];
//     }
//     return result;
// }

// export function generateSecureToken(length: number = 32): string {
//     const array = new Uint8Array(length);
//     crypto.getRandomValues(array);
//     return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
// }

// export function generateOTP(length: number = 6): string {
//     let result = '';
//     const array = new Uint32Array(length);
//     crypto.getRandomValues(array);
//     for (let i = 0; i < length; i++) {
//         result += (array[i] % 10).toString();
//     }
//     return result;
// }

// export function generateTimeId(): string {
//     const timestamp = Date.now().toString(36); // компактное представление времени
//     const random = Math.floor(Math.random() * 1e8).toString(36); // случайный хвост
//     return `${timestamp}-${random}`;
// }
