import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    containerWithBg: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#fafafa',
    },
    content: {
        backgroundColor: '#fff',
        borderBottomColor: '#D1D1D6',
        borderBottomWidth: 0.5,
    },
    invite: {
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
    buttons: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        flex: 1,
        padding: 15,
    },
    buttonLeft: {
        paddingRight: 5,
        flex: 1,
    },
    buttonRight: {
        paddingLeft: 5,
        flex: 1,
    },
});
