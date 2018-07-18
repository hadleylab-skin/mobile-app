import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
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
    inner: {
        flex: 1,
        marginBottom: 56,
        backgroundColor: '#fafafa',
    },
    fields: {
        borderBottomColor: '#D1D1D6',
        borderBottomWidth: 0.5,
        backgroundColor: '#fff',
    },
    input: {
        width: Dimensions.get('window').width - 60,
        color: '#000',
        borderBottomWidth: 0.5,
        borderBottomColor: '#000',
        fontSize: 17,
        lineHeight: 19,
        paddingBottom: 5,
    },
    inputEmail: {
        paddingTop: 0,
        paddingBottom: 10,
    },
    errorEmail: {
        paddingTop: 0,
        paddingBottom: 10,
    },
    hasBottomBorder: {
        borderBottomColor: '#D1D1D6',
        borderBottomWidth: 0.5,
    },
    messageWrapper: {
        margin: 15,
        marginBottom: 0,
        alignItems: 'center',
    },
    message: {
        textAlign: 'center',
    },
    buttonWrapper: {
        padding: 15,
        height: 70,
    },
    footer: {
        height: 56,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
    },
});
