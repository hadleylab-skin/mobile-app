import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        height: 44,
        position: 'relative',
    },
    inputContainer: {
        backgroundColor: '#fff',
        height: 30,
        position: 'absolute',
        top: 7,
        left: 0,
        right: 0,
        borderRadius: 5,
        alignItems: 'center',
        flexDirection: 'row',
        paddingLeft: 7,
        paddingRight: 7,
    },
    input: {
        position: 'absolute',
        top: 0,
        left: 28,
        right: 10,
        bottom: 0,
        fontSize: 14,
        lineHeight: 16,
    },
    text: {
        backgroundColor: 'transparent',
        color: '#ACB5BE',
        fontSize: 14,
        lineHeight: 16,
        marginLeft: 8,
    },
});
