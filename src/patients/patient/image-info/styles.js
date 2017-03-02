import { Dimensions, StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    imageWrapper: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').width,
        backgroundColor: '#EFEFF4',
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
        lineHeight: 16,
        fontWeight: '300',
        height: 30,
    },
    error: {
        marginTop: 10,
        paddingLeft: 15,
        marginBottom: -8,
    },
});
