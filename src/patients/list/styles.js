import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
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
        backgroundColor: '#FAFAFA',
        paddingTop: 120,
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
