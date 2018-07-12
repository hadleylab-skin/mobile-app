import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    patient: {
        paddingLeft: 15,
        paddingRight: 15,
        position: 'relative',
    },
    patientInner: {
        paddingTop: 10,
        paddingBottom: 15,
        alignItems: 'stretch',
        flexWrap: 'nowrap',
        flexDirection: 'row',
    },
    header: {
        padding: 15,
        paddingTop: 20,
        position: 'relative',
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    border: {
        position: 'absolute',
        left: 15,
        right: 15,
        bottom: 0,
        height: 0.5,
        backgroundColor: '#dadada',
    },
});
