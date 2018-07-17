import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 30,
        borderRadius: 5,
        borderWidth: 0.5,
    },
    containerDisabled: {
        opacity: 0.2,
    },
    item: {
        width: 100,
        alignItems: 'center',
        paddingTop: 6,
        borderRadius: 3,
    },
    text: {
        fontSize: 15,
        lineHeight: 17,
        backgroundColor: 'transparent',
    },
});
