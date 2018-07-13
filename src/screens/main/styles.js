import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    modal: {
        alignItems: undefined,
        justifyContent: undefined,
    },
    header: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
        fontSize: 18,
    },
    participantLockWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
    },
    participantLockText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    participantLockButton: {
        marginTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
        width: '100%',
        height: 40,
    },
});
