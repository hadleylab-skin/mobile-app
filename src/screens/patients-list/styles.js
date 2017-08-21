import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 64,
    },
    containerEmpty: {
        backgroundColor: '#FAFAFA',
    },
    filter: {
        height: 44,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ACB5BE',
        backgroundColor: 'rgba(172,181,190,0.4)',
        paddingLeft: 15,
        paddingRight: 15,
        justifyContent: 'center',
    },
    activityIndicator: {
        position: 'absolute',
        top: 85,
        left: 0,
        right: 0,
        justifyContent: 'center',
        zIndex: 1,
    },
    emptyList: {
        flex: 1,
        paddingTop: 30,
        paddingLeft: 30,
        paddingRight: 30,
        alignItems: 'center',
    },
    title: {
        marginBottom: 25,
        fontSize: 17,
        lineHeight: 20,
        color: '#ACB5BE',
    },
    button: {
        flexDirection: 'row',
    },
});
