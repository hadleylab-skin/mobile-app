import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 64,
        position: 'relative',
        paddingLeft: 10,
        paddingRight: 10,
    },
    header: {
        alignItems: 'center',
        marginTop: 25,
        marginBottom: 25,
    },
    title: {
        fontSize: 35,
        lineHeight: 37,
        marginBottom: 15,
        textAlign: 'center',
    },
    text: {
        fontSize: 17,
        lineHeight: 19,
        textAlign: 'center',
    },
    webViewWrapper: {
        flex: 1,
        marginBottom: 60,
    },
    buttons: {
        position: 'absolute',
        left: -10,
        bottom: 0,
        right: -10,
        height: 50,
        borderTopWidth: 0.5,
        borderTopColor: '#dadada',
        flexDirection: 'row',
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        paddingLeft: 10,
        paddingRight: 10,
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        height: 50,
        paddingLeft: 18,
        paddingRight: 18,
    },
    buttonRight: {
        alignItems: 'flex-end',
    },
    buttonText: {
        fontSize: 17,
        lineHeight: 19,
        color: '#FC3159',
    },
});
