import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    wrapperBg: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 10,
        position: 'relative',
    },
    bg: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    buttonWrapper: {
        flexDirection: 'row',
    },
    button: {
        height: 60,
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonCancel: {
        borderRadius: 15,
        marginTop: 10,
        backgroundColor: '#fff',
    },
    hasBottomBorder: {
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0,0,0,0.15)',
    },
    buttons: {
        borderRadius: 15,
        overflow: 'hidden',
    },
    text: {
        fontSize: 20,
        lineHeight: 24,
    },
    textRed: {
        color: '#FC3159',
    },
});
