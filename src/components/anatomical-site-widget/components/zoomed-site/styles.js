import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 64,
    },
    wrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 56,
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
    footerInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        lineHeight: 20,
        color: '#ACB5BE',
        backgroundColor: 'transparent',
    },
    textPink: {
        color: '#FC3159',
    },
    textButton: {
        paddingTop: 10,
        paddingBottom: 10,
    },
    defaultImageWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageURI: {
        height: Dimensions.get('window').height - 64,
        width: Dimensions.get('window').width,
    },
    activityIndicator: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 64,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
});
