import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        paddingTop: 65,
        position: 'relative',
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    buttons: {
        position: 'absolute',
        left: -10,
        bottom: 0,
        right: -10,
        height: 50,
        borderTopWidth: 0.5,
        borderTopColor: '#dadada',
        flexDirection: 'row',
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        paddingLeft: 10,
        paddingRight: 10,
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        height: 50,
        paddingLeft: 18,
        paddingRight: 18,
    },
    buttonRight: {
        alignItems: 'flex-end',
    },
    buttonText: {
        fontSize: 17,
        lineHeight: 19,
        color: '#FC3159',
    },
    text: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 10,
        paddingBottom: 20,
        fontSize: 18,
        alignSelf: 'center',
        flexWrap: 'wrap',
    },
});
