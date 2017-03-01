import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 15,
        alignItems: 'center',
    },
    widget: {
        width: 320,
        height: 598,
        position: 'relative',
    },
    siteWrapper: {
        position: 'absolute',
    },
    head: {
        left: 124,
        width: 70,
        height: 76,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    neck: {
        left: 140,
        top: 75.2,
        width: 38,
        height: 91,
        alignItems: 'center',
    },
    rightShoulder: {
        left: 80.5,
        top: 92,
        height: 66,
        width: 64,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },
    rightChest: {
        right: 160.5,
        top: 111.2,
        height: 82,
        width: 50,
        alignItems: 'flex-end',
    },
});
