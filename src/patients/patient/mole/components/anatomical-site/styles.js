import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    preview: {
        position: 'relative',
    },
    previewImage: {
        overflow: 'hidden',
        height: 140,
    },
    previewDefault: {
        paddingTop: 10,
        paddingBottom: 10,
        borderTopWidth: 0.5,
        borderTopColor: '#DADADA',
        borderBottomWidth: 0.5,
        borderBottomColor: '#DADADA',
        alignItems: 'center',
    },
    defaultImageWrapper: {
        position: 'relative',
        backgroundColor: '#fff',
    },
    dot: {
        position: 'absolute',
        marginLeft: -9,
        marginTop: -9,
    },
    site: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    siteText: {
        fontSize: 15,
        lineHeight: 17,
        color: '#ACB5BE',
    },
    siteArrow: {
        width: 8,
        height: 13,
        marginLeft: 8,
    },
    activityIndicator: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
