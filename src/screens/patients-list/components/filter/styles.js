import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        marginRight: 15,
    },
    absolute: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    bg: {
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    buttonWrapper: {
        position: 'absolute',
        top: 74,
        left: 15,
    },
    list: {
        position: 'absolute',
        top: 114,
        left: 10,
        right: 10,
        marginTop: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: 'rgba(0,0,0,0.25)',
        shadowOffset: { width: -5, height: 5 },
        shadowRadius: 10,
        shadowOpacity: 1,
    },
    listItem: {
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cancel: {
        borderTopWidth: 0.5,
        borderTopColor: '#DADADA',
    },
    text: {
        flex: 1,
        fontSize: 17,
        lineHeight: 19,
        backgroundColor: 'transparent',
    },
    redText: {
        color: '#FC3159',
    },
});
