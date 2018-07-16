import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    noItemsWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    noItemsText: {
        marginTop: 20,
        fontSize: 18,
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
});
