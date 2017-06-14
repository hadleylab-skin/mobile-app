import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
        position: 'relative',
    },
    border: {
        position: 'absolute',
        left: 15,
        right: 15,
        bottom: 0,
        height: 0.5,
        backgroundColor: '#dadada',
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
