import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
        marginLeft: 15,
    },
    title: {
        fontSize: 16,
        lineHeight: 16,
        fontWeight: '300',
        flex: 1,
        paddingTop: 7,
        paddingBottom: 8,
    },
    text: {
        flex: 1,
        fontSize: 16,
        lineHeight: 16,
        fontWeight: '300',
        paddingLeft: 15,
        textAlign: 'right',
    },
    wrapper: {
        marginTop: 8,
        marginBottom: 0,
        paddingBottom: 7,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    submitWrapper: {
        paddingTop: 10,
        paddingRight: 15,
        paddingBottom: 10,
        paddingLeft: 15,
        alignItems: 'flex-end',
        backgroundColor: '#FAFAFA',
        borderTopWidth: 0.5,
        borderTopColor: '#DADADA',
    },
    submitText: {
        fontSize: 17,
        lineHeight: 20,
        color: '#FC3159',
        fontWeight: '500',
    },
});
