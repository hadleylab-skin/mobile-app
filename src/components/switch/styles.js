import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 30,
        borderRadius: 5,
        borderWidth: 0.5,
        borderColor: '#ACB5BE',
    },
    containerDisabled: {
        opacity: 0.2,
    },
    item: {
        width: 100,
        alignItems: 'center',
        paddingTop: 6,
    },
    activeItem: {
        backgroundColor: '#ACB5BE',
        borderRadius: 3,
    },
    text: {
        color: '#ACB5BE',
        fontSize: 15,
        lineHeight: 17,
    },
    activeItemText: {
        color: '#fff',
    },
});
