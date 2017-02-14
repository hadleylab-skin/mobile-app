import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    activityIndicator: {
        position: 'absolute',
        top: 85,
        left: 0,
        right: 0,
        justifyContent: 'center',
        zIndex: 1,
    },
    groupTitleWrapper: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
        backgroundColor: 'rgba(204, 204, 204, 0.1)',
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
        borderBottomColor: '#ccc',
        marginTop: 8,
        marginBottom: 0,
        marginLeft: 15,
        paddingBottom: 7,
        paddingRight: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    wrapperFull: {
        marginLeft: 0,
        paddingLeft: 15,
    },
    inputsWrapper: {},
    input: {
        color: '#000',
        fontSize: 16,
        lineHeight: 16,
        fontWeight: '300',
    },
});
