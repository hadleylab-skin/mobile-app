import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    activityIndicator: {
        position: 'absolute',
        left: 0,
        top: 15,
        right: 0,
        zIndex: 1,
        justifyContent: 'center',
    },
    groupTitleWrapper: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#D1D1D6',
        backgroundColor: '#E5E5EA',
        padding: 15,
    },
    groupTitle: {
        fontSize: 16,
        lineHeight: 16,
        fontWeight: '300',
        flex: 1,
    },
    groupText: {
        fontSize: 16,
        lineHeight: 16,
        fontWeight: '300',
    },
    wrapper: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#D1D1D6',
        marginTop: 8,
        marginLeft: 15,
        paddingBottom: 7,
        paddingRight: 15,
    },
    wrapperFull: {
        marginLeft: 0,
        paddingLeft: 15,
    },
    input: {
        color: '#000',
        fontSize: 16,
        lineHeight: 20,
        fontWeight: '300',
        height: 30,
    },
    error: {
        marginTop: 10,
        paddingLeft: 15,
        marginBottom: -8,
    },
});
