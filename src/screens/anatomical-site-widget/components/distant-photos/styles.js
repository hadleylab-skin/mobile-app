import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        position: 'absolute',
        left: 5,
        top: 140,
    },
    button: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(94,114,134,0.4)',
    },
    buttonText: {
        backgroundColor: 'transparent',
        color: '#fff',
        fontSize: 13,
        lineHeight: 15,
        textAlign: 'center',
        marginTop: 3,
    },
    photoWrapper: {
        width: 60,
        height: 60,
        position: 'relative',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    photo: {
        width: 60,
        height: 60,
        zIndex: 1,
    },
    activityIndicator: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
