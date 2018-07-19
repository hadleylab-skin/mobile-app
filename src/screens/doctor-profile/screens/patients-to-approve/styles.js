import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    noItemsWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    noItemsText: {
        marginTop: 20,
        fontSize: 17,
        lineHeight: 20,
        color: '#ACB5BE',
    },
    tabBar: {
        paddingTop: 60,
        backgroundColor: '#fff',
    },
    tabBarLabel: {
        color: '#000',
    },
    tabBarIndicator: {
        backgroundColor: '#FF1D70',
    },
    activityIndicator: {
        position: 'absolute',
        top: 120,
        left: 0,
        right: 0,
        justifyContent: 'center',
        zIndex: 1,
    },
    item: {
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
});
