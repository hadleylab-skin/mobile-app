import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    inner: {
        marginBottom: 56,
        backgroundColor: '#fafafa',
    },
    form: {
        backgroundColor: '#fff',
        borderBottomColor: '#D1D1D6',
        borderBottomWidth: 0.5,
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
    button: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#fafafa',
        borderBottomWidth: 0.5,
        borderBottomColor: '#dadada',
    },
    generalInfo: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 15,
        paddingLeft: 15,
        paddingBottom: 15,
        backgroundColor: '#fff',
    },
    photoWrapper: {
        width: 95,
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: 19,
    },
    photo: {
        width: 76,
        height: 76,
        borderRadius: 38,
    },
    footer: {
        height: 56,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    name: {
        flex: 1,
    },
    input: {
        height: 40,
        color: '#000',
        fontSize: 17,
        lineHeight: 19,
        paddingTop: 10,
    },
    error: {
        paddingTop: 10,
    },
    inputFirstName: {
        paddingTop: 0,
        paddingBottom: 10,
    },
    errorFirstName: {
        paddingTop: 0,
        paddingBottom: 10,
    },
    hasBottomBorder: {
        borderBottomColor: '#D1D1D6',
        borderBottomWidth: 0.5,
    },
    text: {
        marginTop: 3,
        fontSize: 12,
        lineHeight: 14,
    },
});
