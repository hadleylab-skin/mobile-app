import React, { PropTypes } from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    View,
} from 'react-native';
import { Input } from 'components';
import schema from 'libs/state';
import tv4 from 'tv4';


const createPatientSchema = {
    title: 'Create patient form',
    type: 'object',
    properties: {
        firstname: {
            type: 'string',
            minLength: 2,
        },
        lastName: {
            type: 'string',
            minLength: 2,
        },
    },
    required: ['firstname', 'lastname'],
};


const model = {
    tree: {
        form: {
            firstname: '',
            lastname: '',
        },
        serverAnswer: { status: 'NotAsked' },
    },
};

export function getRoute(props, navigator) {
    const passProps = {
        tree: props.tree.newPatient,
        createPatientService: props.createPatientService,
        onPatientAdded: (patient) => {
            props.changeCurrentPatient(patient);
            props.patientsService(props.tree.patients);
        },
    };

    return {
        component: AddPatient,
        leftButtonTitle: 'Cancel',
        onLeftButtonPress: () => navigator.pop(),
        title: 'Create patient',
        rightButtonTitle: 'Done',
        onRightButtonPress: () => submit(passProps, navigator),
        navigationBarHidden: false,
        tintColor: '#FF2D55',
        passProps,
    };
}

async function submit(props, navigator) {
    const formData = props.tree.form.get();
    const validationResult = tv4.validateResult(formData, createPatientSchema);
    if (!validationResult.valid) {
        Alert.alert(
            'Create Patient Error',
            validationResult.error.message);
        return;
    }

    const result = await props.createPatientService(
        props.tree.serverAnswer,
        formData);

    if (result.status === 'Failure') {
        Alert.alert(
            'Create Patient Error',
            JSON.stringify(result));
    } else {
        navigator.pop();
        props.tree.form.set(model.tree);
        props.onPatientAdded(result.data);
    }
}

export const AddPatient = schema(model)(React.createClass({
    propTypes: {
        navigator: PropTypes.object.isRequired,
        tree: BaobabPropTypes.cursor.isRequired,
        onPatientAdded: PropTypes.func.isRequired,
    },

    render() {
        const firstNameCursor = this.props.tree.form.firstname;
        const lastNameCursor = this.props.tree.form.lastname;
        const status = this.props.tree.serverAnswer.status.get();
        const showLoader = status === 'Loading';

        return (
            <View>
                <View style={styles.container}>
                    <Input
                        label="First Name"
                        cursor={firstNameCursor}
                        inputWrapperStyle={styles.inputWrapperStyle}
                        inputStyle={styles.inputStyle}
                        placeholderTextColor="#ccc"
                        returnKeyType="next"
                    />
                    <Input
                        label="Last Name"
                        cursor={lastNameCursor}
                        inputWrapperStyle={styles.inputWrapperStyle}
                        inputStyle={styles.inputStyle}
                        placeholderTextColor="#ccc"
                        returnKeyType="next"
                    />
                </View>
                <ActivityIndicator
                    animating={showLoader}
                    size="large"
                    color="#FF2D55"
                />
            </View>
        );
    },
}));

const styles = StyleSheet.create({
    container: {
        paddingTop: 84,
        paddingLeft: 30,
    },
    inputWrapperStyle: {
        borderBottomColor: '#ccc',
        marginBottom: 20,
    },
    inputStyle: {
        color: '#333',
    },
});

