import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
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
    skipLabelWrapper: {
        marginTop: 40,
        alignItems: 'center',
    },
    buttonWrapper: {
        marginTop: 40,
        height: 40,
    },
});
