import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    text: {
        color: '#fff',
        fontSize: 12,
        lineHeight: 12,
        textAlign: 'center',
    },
    clickableArea: {
        paddingTop: 8,
        paddingLeft: 30,
        paddingRight: 30,
        paddingBottom: 7,
    },
    inputWrapper: {
        borderBottomColor: 'rgba(255,255,255,0.3)',
        borderBottomWidth: 0.5,
        marginBottom: 35,
        flexDirection: 'row',
    },
    input: {
        height: 40,
        width: Dimensions.get('window').width - 60,
        color: '#fff',
    },
    label: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        lineHeight: 12,
    },
    button: {
        flexDirection: 'row',
    },

    switchWrapper: {
        marginTop: 15,
        marginBottom: 15,
        alignItems: 'flex-end',
    },

    formSwitchWrapper: {
        marginTop: 15,
        marginBottom: 20,
        alignItems: 'center',
    },

    errorWrapper: {
        backgroundColor: 'transparent',
    },
    error: {
        color: '#fff',
    },
});
