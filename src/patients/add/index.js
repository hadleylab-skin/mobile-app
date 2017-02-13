import React from 'react';
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

async function submit(props, navigator, getForm) {
    const formData = props.tree.form.get();
    const validationResult = tv4.validateResult(formData, createPatientSchema);

    if (!validationResult.valid) {
        const mapping = { '/firstname': 0, '/lastname': 1 };
        const errorMessage = validationResult.error.message;

        getForm().formItems[mapping[validationResult.error.dataPath]].showError(errorMessage);
        getForm().formItems[mapping[validationResult.error.dataPath]].focus();

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
        register: React.PropTypes.func.isRequired,
    },

    render() {
        const firstNameCursor = this.props.tree.form.firstname;
        const lastNameCursor = this.props.tree.form.lastname;
        const status = this.props.tree.serverAnswer.status.get();
        const showLoader = status === 'Loading';

        return (
            <View>
                <Form
                    ref={this.props.register}
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
                    />
                    <Input
                        label="Last Name"
                        cursor={lastNameCursor}
                        inputWrapperStyle={s.inputWrapperStyle}
                        inputStyle={s.inputStyle}
                        placeholderTextColor="#ccc"
                        returnKeyType="done"
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
    let form;
    let passProps = {
        register: (ref) => { form = ref; },
        tree: props.tree.newPatient,
        createPatientService: props.createPatientService,
        onPatientAdded: (patient) => {
            props.changeCurrentPatient(patient);
            props.patientsService(props.tree.patients);
        },
    };

    const doSubmit = async () => submit(passProps, navigator, () => form);

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
