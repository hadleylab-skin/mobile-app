import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    ActivityIndicator,
    Alert,
    View,
    ScrollView,
} from 'react-native';
import { Form, Input, DatePicker, ScanMrnButton, InfoField } from 'components';
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
            mrn: '',
            dob: '',
            sex: '',
        },
        datePickerCursor: {},
        serverAnswer: { status: 'NotAsked' },
        scanResult: { status: 'NotAsked' },
    },
};

async function submit(props, context, getInput) {
    const formData = {
        firstname: '',
        lastname: '',
        ..._.pickBy(props.tree.form.get()),
    };
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

        const firstErrorPath = validationResult.errors[0].dataPath.substr(1);
        getInput(firstErrorPath).focus();

        return;
    }

    const result = await context.services.createPatientService(
        props.tree.serverAnswer,
        formData);

    if (result.status === 'Failure') {
        if (result.error.data.mrn) {
            getInput('mrn').showError(result.error.data.mrn);
            return;
        }

        Alert.alert(
            'Create Patient Error',
            JSON.stringify(result));
    } else {
        context.mainNavigator.pop();
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

    componentWillMount() {
        this.props.tree.set(model.tree);
    },

    registerGetInput(ref) {
        if (ref) {
            this.props.registerGetInput(ref.getInput.bind(ref));
        }
    },

    setupData(data) {
        _.each(data, (value, key) => {
            if (value) {
                this.props.tree.form.select(key).set(value);
            }
        });
    },

    render() {
        const firstNameCursor = this.props.tree.form.firstname;
        const lastNameCursor = this.props.tree.form.lastname;
        const mrnCursor = this.props.tree.form.mrn;
        const dobCursor = this.props.tree.form.dob;
        const sexCursor = this.props.tree.form.sex;

        const mrn = mrnCursor.get();
        const dob = dobCursor.get();
        const sex = sexCursor.get();

        const uploadStatus = this.props.tree.serverAnswer.get('status');
        const scanStatus = this.props.tree.scanResult.get('status');

        const showLoader = uploadStatus === 'Loading' || scanStatus === 'Loading';

        return (
            <ScrollView>
                {showLoader ? (
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating={showLoader}
                            size="large"
                            color="#FF2D55"
                        />
                    </View>
                ) : null}
                <Form
                    ref={this.registerGetInput}
                    onSubmit={this.props.submit}
                >
                    <View style={{ paddingLeft: 15 }}>
                        <Input
                            label="First Name"
                            cursor={firstNameCursor}
                            inputWrapperStyle={s.inputWrapperStyle}
                            inputStyle={s.inputStyle}
                            errorStyle={s.error}
                            placeholderTextColor="#ccc"
                            returnKeyType="next"
                            name="firstname"
                        />
                        <Input
                            label="Last Name"
                            cursor={lastNameCursor}
                            inputWrapperStyle={s.inputWrapperStyle}
                            inputStyle={s.inputStyle}
                            errorStyle={s.error}
                            placeholderTextColor="#ccc"
                            returnKeyType={mrn || dob || sex ? 'next' : 'done'}
                            name="lastname"
                        />
                        {
                            mrn
                        ?
                            <Input
                                label="MRN"
                                cursor={mrnCursor}
                                inputWrapperStyle={s.inputWrapperStyle}
                                inputStyle={s.inputStyle}
                                placeholderTextColor="#ccc"
                                returnKeyType={dob || sex ? 'next' : 'done'}
                                keyboardType="numeric"
                                name="mrn"
                            />
                        :
                            null
                        }
                    </View>
                    {
                        dob
                    ?
                        <DatePicker
                            tree={this.props.tree.datePickerCursor}
                            cursor={dobCursor}
                            title="Date of Birth"
                        />
                    :
                        null
                    }
                    {
                        sex
                    ?
                        <InfoField
                            title="Sex"
                            text={sex}
                            onPress={() => sexCursor.set(sex && sex === 'Male' ? 'Female' : 'Male')}
                        />
                    :
                        null
                    }
                </Form>
                <ScanMrnButton
                    cursor={this.props.tree.scanResult}
                    setupData={this.setupData}
                />
            </ScrollView>
        );
    },
}));

export function getRoute(props, context) {
    let getInput;
    let passProps = {
        registerGetInput: (_getInput) => { getInput = _getInput; },
        tree: props.tree.newPatient,
        onPatientAdded: (patient) => {
            props.changeCurrentPatient(patient);
            context.services.patientsService(props.tree.patients);
        },
    };

    const doSubmit = async () => submit(passProps, context, getInput);

    passProps.submit = doSubmit;

    return {
        component: AddPatient,
        leftButtonTitle: 'Cancel',
        onLeftButtonPress: () => context.mainNavigator.pop(),
        title: 'Create patient',
        rightButtonTitle: 'Done',
        onRightButtonPress: doSubmit,
        navigationBarHidden: false,
        tintColor: '#FF2D55',
        passProps,
    };
}
