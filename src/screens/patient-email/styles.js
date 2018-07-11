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
        paddingTop: 76,
        paddingLeft: 15,
        paddingRight: 15,
        backgroundColor: '#fafafa',
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
    labelWrapper: {
        marginTop: 40,
        alignItems: 'center',
    },
    buttonWrapper: {
        marginTop: 40,
        height: 40,
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
