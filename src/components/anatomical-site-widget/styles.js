import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 15,
        paddingBottom: 15,
        alignItems: 'center',
        height: 660,
    },
    widget: {
        width: 320,
        position: 'relative',
    },
    flip: {
        width: 70,
        position: 'absolute',
        right: 15,
        top: 15,
        alignItems: 'flex-end',
        zIndex: 1,
    },
    siteWrapper: {
        position: 'absolute',
    },
});
