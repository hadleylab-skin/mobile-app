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
    pinkBg: {
        position: 'absolute',
        top: -250,
        left: 0,
        height: 260,
        right: 0,
        backgroundColor: '#FF1D70',
    },
    content: {
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#DADADA',
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
    infoMessage: {
        height: 50,
        paddingTop: 5,
        paddingLeft: 20,
        paddingRight: 20,
    },
    activityIndicator: {
        position: 'absolute',
        top: 300,
        left: 0,
        right: 0,
        justifyContent: 'center',
        zIndex: 1,
    },
});
