import { NativeModules } from 'react-native';
import { RSA } from 'react-native-rsa-native';
import CryptoJS from 'crypto-js';

const { RNSecretManager } = NativeModules;

const iv = CryptoJS.enc.Latin1.parse('{+!%i=]%Y/upi8!Z');

export async function getKeyPair() {
    const keys = await RNSecretManager.getKeyPair();
    const publicKey = keys.public;
    const privateKey = keys.private;

    return {
        publicKey,
        privateKey,
    };
}

export async function createKeyPair() {
    const key = await RSA.generate();
    await RNSecretManager.saveKeyPair(key.public, key.private);
    return {
        publicKey: key.public,
        privateKey: key.private,
    };
}

export async function encryptRSA(data, publicKey = undefined) {
    let key = publicKey;
    if (typeof key === 'undefined') {
        const keyPair = await getKeyPair();
        key = keyPair.publicKey;
    }
    return RSA.encrypt(data, key);
}

export async function decryptRSA(data) {
    const keys = await getKeyPair();
    return RSA.decrypt(data, keys.privateKey);
}

export function encryptAES(data, key) {
    return CryptoJS.AES.encrypt(data, key, { iv }).toString();
}

export function decryptAES(ciphertext, key) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key, { iv });
    return bytes.toString(CryptoJS.enc.Utf8);
}

export async function getKeyPairStatus(cursor) {
    cursor.set({ status: 'Loading' });
    try {
        const keys = await getKeyPair();
        cursor.set({ status: keys.publicKey && keys.privateKey ? 'Exists' : 'DoesNotExists' });
    } catch (error) {
        cursor.set({
            status: 'Failure',
            error,
        });
    }
}

export async function createNewKeyPair(cursor) {
    cursor.set('status', 'Loading');
    try {
        await createKeyPair();
        cursor.set({ status: 'Exists' });
    } catch (error) {
        cursor.set({
            status: 'Failure',
            error,
        });
    }
}

