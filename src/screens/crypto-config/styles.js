import { StyleSheet } from 'react-native';

const borders = {
    backgroundColor: '#fff',
    borderTopColor: '#D1D1D6',
    borderTopWidth: 0.5,
    borderBottomColor: '#D1D1D6',
    borderBottomWidth: 0.5,
};

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    content: {
        paddingTop: 15,
        paddingLeft: 45,
        paddingRight: 45,
        paddingBottom: 5,
        marginBottom: 15,
        ...borders,
    },
    fields: { ...borders },
    title: {
        fontSize: 30,
        marginBottom: 10,
    },
    mainTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 15,
        paddingTop: 20,
    },
    text: {
        paddingBottom: 15
    },
    button: {
        marginTop: 15,
        paddingLeft: 45,
        paddingRight: 45,
    },
});
