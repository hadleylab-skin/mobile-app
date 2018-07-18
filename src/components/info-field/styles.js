import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderBottomColor: '#D1D1D6',
        flexWrap: 'nowrap',
        padding: 15,
        position: 'relative',
    },
    leftColumn: {},
    rightColumn: {
        paddingLeft: 15,
        flex: 1,
        alignItems: 'flex-end',
        paddingTop: 1,
    },
    title: {
        fontSize: 17,
        lineHeight: 20,
    },
    text: {
        fontSize: 15,
        lineHeight: 17,
        color: '#ACB5BE',
        textAlign: 'right',
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
