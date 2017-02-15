import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    ActivityIndicator,
    Alert,
    View,
} from 'react-native';
import { Input, Form } from 'components';
import schema from 'libs/state';
import tv4 from 'tv4';
import s from './styles';

const createPatientSchema = {
    title: 'Create patient form',
    type: 'object',
    properties: {
        firstname: {
            type: 'string',
            minLength: 2,
        },
        lastname: {
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

async function submit(props, navigator, getInput) {
    const formData = props.tree.form.get();
    const validationResult = tv4.validateMultiple(formData, createPatientSchema);

    if (!validationResult.valid) {
        _.each(
            validationResult.errors,
            (error) => {
                const errorPath = error.dataPath;
                const errorMessage = error.message;
                const fieldName = errorPath.substr(1);

                getInput(fieldName).showError(errorMessage);
            });
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
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
        tree: BaobabPropTypes.cursor.isRequired,
        onPatientAdded: React.PropTypes.func.isRequired, // eslint-disable-line
        submit: React.PropTypes.func.isRequired,
        registerGetInput: React.PropTypes.func.isRequired,
    },

    registerGetInput(ref) {
        this.props.registerGetInput(ref.getInput.bind(ref));
    },

    render() {
        const firstNameCursor = this.props.tree.form.firstname;
        const lastNameCursor = this.props.tree.form.lastname;
        const status = this.props.tree.serverAnswer.status.get();
        const showLoader = status === 'Loading';

        return (
            <View>
                <Form
                    ref={this.registerGetInput}
                    style={s.container}
                    onSubmit={this.props.submit}
                >
                    <Input
                        label="First Name"
                        cursor={firstNameCursor}
                        inputWrapperStyle={s.inputWrapperStyle}
                        inputStyle={s.inputStyle}
                        placeholderTextColor="#ccc"
                        returnKeyType="next"
                        name="firstname"
                    />
                    <Input
                        label="Last Name"
                        cursor={lastNameCursor}
                        inputWrapperStyle={s.inputWrapperStyle}
                        inputStyle={s.inputStyle}
                        placeholderTextColor="#ccc"
                        returnKeyType="done"
                        name="lastname"
                    />
                </Form>
                <ActivityIndicator
                    animating={showLoader}
                    size="large"
                    color="#FF2D55"
                />
            </View>
        );
    },
}));

export function getRoute(props, navigator) {
    let getInput;
    let passProps = {
        registerGetInput: (_getInput) => { getInput = _getInput; },
        tree: props.tree.newPatient,
        createPatientService: props.createPatientService,
        onPatientAdded: (patient) => {
            props.changeCurrentPatient(patient);
            props.patientsService(props.tree.patients);
        },
    };

    const doSubmit = async () => submit(passProps, navigator, getInput);

    passProps.submit = doSubmit;

    return {
        component: AddPatient,
        leftButtonTitle: 'Cancel',
        onLeftButtonPress: () => navigator.pop(),
        title: 'Create patient',
        rightButtonTitle: 'Done',
        onRightButtonPress: doSubmit,
        navigationBarHidden: false,
        tintColor: '#FF2D55',
        passProps,
    };
}
