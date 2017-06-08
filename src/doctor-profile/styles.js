import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#FAFAFA',
    },
    info: {
        height: 260,
        backgroundColor: '#FF1D70',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
    },
    content: {
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
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    degree: {
        marginTop: 15,
        marginBottom: 10,
        fontSize: 24,
        lineHeight: 30,
        color: '#fff',
    },
    department: {
        fontSize: 15,
        lineHeight: 20,
        color: 'rgba(255,255,255,0.5)',
    },
});
