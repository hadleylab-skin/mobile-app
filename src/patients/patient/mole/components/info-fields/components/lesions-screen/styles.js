import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 64,
        backgroundColor: '#FAFAFA',
    },
    inner: {
        paddingTop: 20,
        backgroundColor: '#fff',
        borderBottomColor: 'rgba(0,0,0,0.3)',
        borderBottomWidth: 0.5,
        marginBottom: 15,
        paddingLeft: 15,
    },
    hasBottomBorder: {
        borderBottomColor: 'rgba(0,0,0,0.3)',
        borderBottomWidth: 0.5,
        marginBottom: 20,
    },
    input: {
        height: 40,
        color: '#000',
    },
    label: {
        color: 'rgba(0,0,0,0.5)',
        fontSize: 12,
        lineHeight: 12,
    },
});
