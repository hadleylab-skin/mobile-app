import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
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
    logout: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 49,
        borderTopWidth: 0.5,
        borderTopColor: '#DADADA',
        borderBottomWidth: 0.5,
        borderBottomColor: '#DADADA',
        backgroundColor: '#fff',
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
});
