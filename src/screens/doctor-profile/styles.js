import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        paddingBottom: 50,
    },
    info: {
        minHeight: 260,
        backgroundColor: '#FF1D70',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        position: 'relative',
    },
    fields: {
        backgroundColor: '#fff',
        borderBottomColor: '#D1D1D6',
        borderBottomWidth: 0.5,
    },
    pinkBg: {
        position: 'absolute',
        top: -250,
        left: 0,
        height: 260,
        right: 0,
        backgroundColor: '#FF1D70',
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    name: {
        marginTop: 15,
        marginBottom: 10,
    },
    text: {
        fontSize: 24,
        lineHeight: 30,
        color: '#fff',
        textAlign: 'center',
    },
    department: {
        fontSize: 15,
        lineHeight: 20,
        color: 'rgba(255,255,255,0.5)',
    },
    activityIndicator: {
        position: 'absolute',
        top: 300,
        left: 0,
        right: 0,
        justifyContent: 'center',
        zIndex: 1,
    },
    topBorder: {
        borderTopColor: '#D1D1D6',
        borderTopWidth: 0.5,
    },
    border: {
        position: 'absolute',
        left: 15,
        right: 0,
        top: 0,
        height: 0.5,
        backgroundColor: '#DADADA',
    },
    fieldContainer: {
        flexDirection: 'row',
        padding: 15,
        paddingRight: 30,
        position: 'relative',
    },
    fieldTitle: {
        fontSize: 17,
        lineHeight: 20,
    },
    exclamation: {
        position: 'absolute',
        right: 15,
        alignSelf: 'center',
    },
    exclamationText: {
        color: 'red',
        fontSize: 30,
        fontWeight: 'bold',
    },
});
