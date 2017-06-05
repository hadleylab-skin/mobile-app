import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    carousel: {
        height: width,
        position: 'relative',
        alignItems: 'center',
    },
    galleryItem: {
        height: width,
        position: 'relative',
    },
    galleryImage: {
        height: width,
        width,
    },
    dateWrraper: {
        position: 'absolute',
        alignItems: 'center',
        top: 15,
        left: 15,
        right: 15,
        zIndex: 1,
    },
    date: {
        color: '#fff',
        fontSize: 15,
        lineHeight: 16,
        backgroundColor: 'transparent',
    },
    dots: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        bottom: 18,
        left: 15,
        right: 15,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.4)',
        margin: 4,
    },
    activeDot: {
        backgroundColor: '#fff',
    },
    thumbs: {
        flexDirection: 'row',
        height: 80,
    },
    thumbWrapper: {
        width: 80,
        height: 80,
        backgroundColor: '#fff',
        padding: 3,
    },
    activeThumb: {
        backgroundColor: '#FC3159',
    },
    thumb: {
        width: 74,
        height: 74,
    },
});
