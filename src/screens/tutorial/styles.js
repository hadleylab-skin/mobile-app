import { StyleSheet, Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;

export default StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        paddingBottom: 100,
        backgroundColor: '#FFF',
    },
    pageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: windowWidth,
        paddingLeft: 10,
        paddingRight: 10,
    },
    bottomButton: {
        position: 'absolute',
        height: 50,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F20F6F33',
    },
    bottomButtonText: {
        textAlign: 'center',
        color: '#FF1D70',
        fontSize: 16,
        lineHeight: 50,
    },
    bottomButtonLast: {
        backgroundColor: '#F20F6F',
    },
    bottomButtonTextLast: {
        color: '#FFF',
    },
    dots: {
        position: 'absolute',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        bottom: 50,
        left: 0,
        right: 0,
    },
    dot: {
        width: 10,
        height: 10,
        backgroundColor: '#ccc',
        borderRadius: 5,
        marginLeft: 10,
        marginRight: 10,
    },
    dotActive: {
        backgroundColor: '#FF1D70',
    },
    header: {
        fontSize: 24,
        lineHeight: 30,
        color: '#FF1D70',
        fontWeight: 'bold',
        padding: 15,
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
        color: '#000',
        textAlign: 'center',
    },
    image: {
        width: windowWidth - 100,
        height: windowWidth - 100,
        marginTop: 25,
        marginBottom: 25,
    },
});
