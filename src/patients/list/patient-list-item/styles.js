import { Dimensions, StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
        flex: 1,
    },
    select: {
        width: 100,
        flex: 0,
        backgroundColor: 'rgba(255,45,85, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '500',
    },
    inner: {
        flex: 1,
        width: Dimensions.get('window').width,
        padding: 15,
        alignItems: 'stretch',
        flexWrap: 'nowrap',
        flexDirection: 'row',
    },
    img: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    info: {
        flex: 1,
        paddingLeft: 15,
    },
    text: {
        color: '#333',
        marginBottom: 5,
        fontSize: 14,
    },
});
