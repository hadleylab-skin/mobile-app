import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: '#D1D1D6',
        paddingTop: 8,
        marginLeft: 15,
        paddingBottom: 7,
        paddingRight: 15,
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
        fontSize: 16,
        lineHeight: 16,
        fontWeight: '300',
        paddingLeft: 15,
        flex: 1,
        textAlign: 'right',
    },
});
