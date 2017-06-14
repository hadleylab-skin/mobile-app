import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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
    inputWrapperStyle: {
        borderBottomColor: '#ccc',
        borderBottomWidth: 0.5,
    },
    inputStyle: {
        color: '#000',
        fontSize: 16,
        lineHeight: 20,
        fontWeight: '300',
        height: 45,
        paddingTop: 13,
        paddingBottom: 12,
        marginBottom: 0,
    },
    error: {
        marginTop: 10,
        marginBottom: -10,
    },
    button: {
        flexDirection: 'row',
        padding: 15,
    },
});

