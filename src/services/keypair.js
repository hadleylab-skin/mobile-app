import { NativeModules } from 'react-native';
import { RSA } from 'react-native-rsa-native';
import CryptoJS from 'crypto-js';
import _ from 'lodash';

const { RNSecretManager } = NativeModules;

const iv = CryptoJS.enc.Latin1.parse('{+!%i=]%Y/upi8!Z');
const padding = CryptoJS.pad.Pkcs7;
const mode = CryptoJS.mode.CBC;

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
    return CryptoJS.AES.encrypt(data, key, { iv, mode, padding }).toString();
}

export function decryptAES(ciphertext, key) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key, { iv, mode, padding });
    return bytes.toString(CryptoJS.enc.Utf8);
}

export async function getKeyPairStatus(cursor, doctor, password) {
    const firstTime = _.isEmpty(cursor.get());
    cursor.set({ status: 'Loading', firstTime });
    let data;
    try {
        const keys = await getKeyPair();
        const remotePrivateKey = decryptAES(doctor.privateKey, password);
        const remotePublicKey = doctor.publicKey;

        const keyPairStatus = {
            exported: !_.isEmpty(remotePrivateKey),
            publicMatch: remotePublicKey === keys.publicKey,
            privateMatch: remotePrivateKey === keys.privateKey,
        };

        const status = keyPairStatus.publicMatch ? 'Succeed' : 'Failure';

        data = {
            status,
            keyPairStatus,
            data: { ...keys },
        };
    } catch (error) {
        data = {
            status: 'Failure',
            error,
        };
    }
    cursor.set({ firstTime, ...data });
    return data;
}

export async function createNewKeyPair(cursor) {
    cursor.set('status', 'Loading');
    let data;
    try {
        const keys = await createKeyPair();
        data = {
            status: 'Exists',
            ...keys,
        };
    } catch (error) {
        data = {
            status: 'Failure',
            error,
        };
    }
    cursor.set(data);
    return data;
}

