import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        textAlign: 'center',
        lineHeight: 20,
    },
    pinkButton: {
        height: 44,
        borderWidth: 1,
        borderColor: '#fc3159',
        borderRadius: 5,
    },
    pinkText: {
        fontSize: 15,
        color: '#fc3159',
    },
    whiteButton: {
        height: 50,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 5,
    },
    whiteText: {
        fontSize: 15,
        color: '#fff',
    },
    rectButton: {
        height: 56,
        backgroundColor: '#fc3159',
        borderColor: '#fc3159',
    },
    greenButton: {
        height: 44,
        borderWidth: 1,
        borderColor: '#00b33c',
        borderRadius: 5,
    },
    greenText: {
        fontSize: 15,
        color: '#009933',
    },
    rectText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },

});
