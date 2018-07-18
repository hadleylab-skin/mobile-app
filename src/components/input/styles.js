import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        position: 'relative',
    },
    errorWrapper: {
        position: 'absolute',
        top: 0,
        bottom: 1,
        right: 5,
        justifyContent: 'center',
        maxWidth: 170,
        backgroundColor: '#fff',
        zIndex: 1,
    },
    error: {
        color: '#FC3159',
        fontSize: 13,
        lineHeight: 15,
        textAlign: 'right',
    },
});
