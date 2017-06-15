import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    mole: {
        position: 'relative',
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 15,
        paddingRight: 10,
    },
    arrow: {
        position: 'absolute',
        right: 10,
        top: 12,
        width: 8,
        height: 13,
    },
    photoWrapper: {
        position: 'relative',
        width: 85,
    },
    photo: {
        width: 70,
        height: 70,
        zIndex: 1,
    },
    bottomPhoto: {
        position: 'absolute',
        left: 4,
        top: 4,
        opacity: 0.6,
        zIndex: 0,
    },
    infoWrapper: {
        flex: 1,
        paddingRight: 10,
    },
    titleWrapper: {
        marginBottom: 10,
    },
    title: {
        fontSize: 17,
        color: '#000',
    },
    textWrapper: {
        marginBottom: 5,
    },
    text: {
        fontSize: 12,
        lineHeight: 15,
        color: '#ACB5BE',
    },
    textRed: {
        color: '#FC3159',
    },
    border: {
        position: 'absolute',
        left: 15,
        right: 0,
        top: 0,
        height: 0.5,
        backgroundColor: '#DADADA',
    },
});
