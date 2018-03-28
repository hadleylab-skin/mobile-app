import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    buttons: {
        backgroundColor: '#f1f1f1',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        height: 49,
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        flex: 1,
        padding: 5,
    },
    button: {
        flexDirection: 'column',
        flex: 0.5,
    }
});
