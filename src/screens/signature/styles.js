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
    signature: {
        height: 100,
        borderWidth: 0,
        marginLeft: 15,
        marginRight: 15,
    },
    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonWrapper: {
        width: 150,
        paddingBottom: 15,
    },
    button: {
        justifyContent: 'center',
        height: 50,
        paddingLeft: 18,
        paddingRight: 18,
    },
    buttonText: {
        fontSize: 17,
        lineHeight: 19,
        color: '#FC3159',
    },
    activityIndicator: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

