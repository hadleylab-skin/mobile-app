import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 49,
    },
    safeWrapper: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    indicator: {
        position: 'absolute',
        left: 2,
        top: 2,
        right: 2,
        bottom: 2,
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
});
