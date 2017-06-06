import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    inner: {
        paddingBottom: 100,
    },
    prediction: {
        paddingTop: 18,
        paddingBottom: 18,
        paddingLeft: 15,
        paddingRight: 15,
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 17,
        lineHeight: 20,
        color: '#000',
    },
    title: {
        color: '#ACB5BE',
    },
    distantPhoto: {
        backgroundColor: '#ccc',
        flex: 1,
        height: 125,
    },
    fields: {
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#DADADA',
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
});
