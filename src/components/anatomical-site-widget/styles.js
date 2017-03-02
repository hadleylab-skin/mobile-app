import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 15,
        paddingBottom: 15,
        alignItems: 'center',
    },
    widget: {
        width: 320,
        height: 598,
        position: 'relative',
    },
    flip: {
        width: 70,
        position: 'absolute',
        right: 15,
        top: 5,
        alignItems: 'flex-end',
        zIndex: 1,
    },
    siteWrapper: {
        position: 'absolute',
    },
});