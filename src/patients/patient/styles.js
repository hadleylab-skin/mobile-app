import { Dimensions, StyleSheet } from 'react-native';

const photosContainerWidth = Dimensions.get('window').width + 2;

export default StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        lineHeight: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    mainPhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginTop: 15,
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 18,
        lineHeight: 18,
        fontWeight: '300',
        textAlign: 'center',
    },
    photos: {
        flexDirection: 'row',
        width: photosContainerWidth,
        marginRight: -2,
        marginBottom: -3,
        marginTop: 15,
        flexWrap: 'wrap',
    },
    photoWrapper: {
        width: photosContainerWidth / 3,
        height: photosContainerWidth / 3,
    },
    withoutImg: {
        backgroundColor: '#fafafa',
        borderWidth: 0.5,
        borderColor: '#ccc',
        width: (photosContainerWidth / 3) - 2,
        height: (photosContainerWidth / 3) - 2,
        justifyContent: 'center',
    },
    photo: {
        width: (photosContainerWidth / 3) - 2,
        height: (photosContainerWidth / 3) - 2,
    },
    text: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 16,
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
