import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
        marginLeft: 15,
        marginRight: 15,
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
    inputWrapperStyle: {
        marginTop: 8,
        marginBottom: 0,
        paddingBottom: 7,
        flexDirection: 'row',
        alignItems: 'center',
    },
});
