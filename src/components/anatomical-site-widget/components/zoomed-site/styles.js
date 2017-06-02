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
        backgroundColor: '#ACB5BE',
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
        color: '#fff',
        backgroundColor: 'transparent',
    },
    textPink: {
        color: '#FC3159',
    },
    textButton: {
        paddingTop: 10,
        paddingBottom: 10,
    },
    imageURI: {
        height: Dimensions.get('window').height - 64,
        width: Dimensions.get('window').width,
    },
});
