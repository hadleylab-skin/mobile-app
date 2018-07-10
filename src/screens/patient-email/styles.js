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
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
        paddingBottom: 150,
        paddingLeft: 30,
        paddingRight: 30,
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
    activityWrapper: {
        marginTop: 40,
    },
});
