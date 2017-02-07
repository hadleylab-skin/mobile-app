import { Dimensions, StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    imageWrapper: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').width,
        backgroundColor: '#efefef',
        justifyContent: 'center',
        position: 'relative',
    },
    photo: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').width,
    },
    indicator: {
        position: 'absolute',
        left: 2,
        top: 2,
        right: 2,
        bottom: 2,
        justifyContent: 'center',
    },
    table: {
        flexDirection: 'row',
    },
    text: {
        flex: 1,
        marginTop: 3,
        marginBottom: 3,
        fontWeight: '300',
    },
    textRight: {
        textAlign: 'right',
        paddingRight: 30,
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
