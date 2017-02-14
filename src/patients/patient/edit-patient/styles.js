import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    groupTitleWrapper: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
        backgroundColor: 'rgba(204, 204, 204, 0.1)',
        padding: 15,
    },
    groupTitle: {
        fontSize: 16,
        lineHeight: 16,
        fontWeight: '300',
        flex: 1,
    },
    groupText: {
        fontSize: 16,
        lineHeight: 16,
        fontWeight: '300',
    },
    wrapper: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
        marginTop: 8,
        marginBottom: 0,
        marginLeft: 15,
        paddingBottom: 7,
        paddingRight: 15,
    },
    wrapperFull: {
        marginLeft: 0,
        paddingLeft: 15,
    },
    input: {
        color: '#000',
        fontSize: 16,
        lineHeight: 16,
        fontWeight: '300',
        height: 30,
    },
});
