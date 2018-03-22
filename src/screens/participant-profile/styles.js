import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    info: {
        backgroundColor: '#FF1D70',
        paddingTop: 20,
        paddingRight: 15,
        paddingBottom: 15,
        paddingLeft: 25,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    logout: {
        borderTopWidth: 0.5,
        borderTopColor: '#DADADA',
        borderBottomWidth: 0.5,
        borderBottomColor: '#DADADA',
        backgroundColor: '#fff',
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginRight: 10,
    },
    name_text: {
        fontSize: 24,
        lineHeight: 30,
        color: '#fff',
    },
    age_text: {
        marginTop: 5,
        fontSize: 16,
        color: '#ccc',
    },
    button: {
        flexDirection: 'row',
        margin: 25,
    },
});
