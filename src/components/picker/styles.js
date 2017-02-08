import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
        marginLeft: 15,
    },
    picker: {
        marginRight: 15,
    },
    title: {
        fontSize: 16,
        lineHeight: 16,
        fontWeight: '300',
        flex: 1,
    },
    text: {
        fontSize: 16,
        lineHeight: 16,
        fontWeight: '300',
    },
    wrapper: {
        marginTop: 8,
        marginBottom: 0,
        paddingBottom: 7,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
});
