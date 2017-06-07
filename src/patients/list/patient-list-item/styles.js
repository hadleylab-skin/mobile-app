import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#dadada',
        flex: 1,
    },
    inner: {
        flex: 1,
        paddingTop: 10,
        paddingBottom: 15,
        alignItems: 'stretch',
        flexWrap: 'nowrap',
        flexDirection: 'row',
    },
    photoWrapper: {
        paddingRight: 15,
    },
    photo: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    info: {
        flex: 1,
    },
    text: {
        color: '#ACB5BE',
        fontSize: 15,
        lineHeight: 17,
    },
    name: {
        color: '#000',
        marginBottom: 5,
        fontSize: 17,
        lineHeight: 20,
    },
});
