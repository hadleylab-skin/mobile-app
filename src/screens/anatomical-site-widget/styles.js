import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 64,
        position: 'relative',
    },
    footer: {
        height: 56,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    message: {
        padding: 15,
        zIndex: 1,
        alignSelf: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        lineHeight: 20,
        color: '#ACB5BE',
        backgroundColor: 'transparent',
    },
    activityIndicator: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
});
