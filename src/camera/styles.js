import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 49,
    },
    camera: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
    },
    textWrapper: {
        position: 'absolute',
        top: 70,
        left: 0,
        right: 0,
    },
    preloaders: {
        position: 'absolute',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        top: 10,
        left: 10,
        right: 10,
    },
    name: {
        color: '#fff',
        fontSize: 30,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    capture: {
        flex: 0,
        padding: 10,
        margin: 40,
    },
    wrapper: {
        position: 'relative',
        zIndex: 1,
        height: 79,
        margin: 2,
    },

    loading: {
        margin: 4,
    },

    error: {
        margin: 4,
    },

    errorShadow: {
        position: 'absolute',
        height: 75,
        width: 50,
        backgroundColor: 'rgba(255,45,85,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    success: {
        borderWidth: 2,
        borderColor: '#0f0',
    },
});
