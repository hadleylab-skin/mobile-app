import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    preview: {
        position: 'relative',
        overflow: 'hidden',
        height: 140,
        borderTopWidth: 0.5,
        borderTopColor: '#D1D1D6',
        borderBottomWidth: 0.5,
        borderBottomColor: '#D1D1D6',
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
