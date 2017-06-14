import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Alert,
    ActivityIndicator,
} from 'react-native';
import _ from 'lodash';
import schema from 'libs/state';
import { Form, Picker, DatePicker, Title, InfoField, ScanMrnButton } from 'components';
import tv4 from 'tv4';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Input from '../input';
import s from './styles';

tv4.setErrorReporter((error, data, itemSchema) => itemSchema.message);

const updatePatientSchema = {
    title: 'Update patient form',
    type: 'object',
    properties: {
        firstName: {
            type: 'string',
            minLength: 2,
        },
        lastName: {
            type: 'string',
            minLength: 2,
        },
        mrn: {
            type: 'string',
            pattern: '^\\d+$',
            message: 'MRN should be an integer number, less than 10 digits',
            maxLength: 10,
        },
    },
    required: ['firstName', 'lastName'],
};

const model = {
    tree: {
        form: {
            firstName: '',
            lastName: '',
            mrn: '',
            dateOfBirth: '',
            sex: '',
            race: '',
        },
        offsetY: 0,
        datePickerCursor: {},
        racePickerCursor: {},
        scanResult: { status: 'NotAsked' },
    },
};

const EditPatient = schema(model)(React.createClass({
    displayName: 'EditPatient',

    propTypes: {
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
        tree: BaobabPropTypes.cursor.isRequired,
        patientCursor: BaobabPropTypes.cursor.isRequired,
        registerGetInput: React.PropTypes.func.isRequired,
    },

    contextTypes: {
        racesList: BaobabPropTypes.cursor.isRequired,
    },

    componentWillMount() {
        const { firstName, lastName, mrn,
                sex, dateOfBirth, race } = this.props.patientCursor.data.get();
        this.props.tree.datePickerCursor.isOpen.set(false);
        this.props.tree.racePickerCursor.isOpen.set(false);
        this.props.tree.form.set({
            firstName,
            lastName,
            mrn,
            dateOfBirth,
            sex,
            race,
        });
    },

    onScroll(e) {
        const offset = e.nativeEvent.contentOffset.y;
        this.props.tree.offsetY.set(offset);
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

    renderSex() {
        const sexCursor = this.props.tree.form.sex;
        const sex = sexCursor.get();

        return (
            <InfoField
                title="Sex"
                text={sex}
                onPress={() => sexCursor.set(sex && sex === 'Male' ? 'Female' : 'Male')} />
        );
    },

    render() {
        const firstNameCursor = this.props.tree.form.firstName;
        const lastNameCursor = this.props.tree.form.lastName;
        const mrnCursor = this.props.tree.form.mrn;
        const raceCursor = this.props.tree.form.race;
        const dateOfBirthCursor = this.props.tree.form.dateOfBirth;
        const offsetY = this.props.tree.offsetY.get();

        const patientStatus = this.props.patientCursor.get('status');
        const scanStatus = this.props.tree.scanResult.get('status');
        const showLoader = patientStatus === 'Loading' || scanStatus === 'Loading';

        return (
            <View style={s.container}>
                {showLoader ? (
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating={showLoader}
                            size="large"
                            color="#FF1D70"
                        />
                    </View>
                ) : null}
                <KeyboardAwareScrollView
                    onScroll={this.onScroll}
                    scrollEventThrottle={200}
                    ref={(ref) => { this.scrollView = ref; }}
                    enableAutoAutomaticScroll={false}
                >
                    <Form
                        ref={this.registerGetInput}
                        onSubmit={() => console.log('submit')} style={{ marginBottom: 40 }}
                    >
                        <View style={s.group}>
                            <Title text="Patient name" />
                            <Input
                                label="First Name"
                                cursor={firstNameCursor}
                                placeholderTextColor="#ccc"
                                returnKeyType="next"
                                name="firstName"
                                onFocus={() => this.scrollView.scrollToPosition(0, -64)}
                            />
                            <Input
                                label="Last Name"
                                cursor={lastNameCursor}
                                fullWidth
                                placeholderTextColor="#ccc"
                                returnKeyType="next"
                                name="lastName"
                                onFocus={() => this.scrollView.scrollToPosition(0, -64)}
                            />
                        </View>
                        <View style={s.group}>
                            <Title text="Medical record number" />
                            <Input
                                label=""
                                cursor={mrnCursor}
                                fullWidth
                                placeholderTextColor="#ccc"
                                returnKeyType="next"
                                keyboardType="numeric"
                                name="mrn"
                                onFocus={() => this.scrollView.scrollToPosition(0, 74)}
                            />
                        </View>
                        <View style={s.group}>
                            <Title text="Patient Information" />
                            <DatePicker
                                tree={this.props.tree.datePickerCursor}
                                cursor={dateOfBirthCursor}
                                title="Date of Birth"
                                onPress={() => this.scrollView.scrollToPosition(0, offsetY + 220)}
                            />
                            {this.renderSex()}
                            <Picker
                                tree={this.props.tree.racePickerCursor}
                                cursor={raceCursor}
                                items={this.context.racesList.data.get()}
                                title="Race"
                                onPress={() => this.scrollView.scrollToPosition(0, offsetY + 220)}
                            />
                        </View>
                        <View style={s.button}>
                            <ScanMrnButton
                                cursor={this.props.tree.scanResult}
                                setupData={this.setupData}
                            />
                        </View>
                    </Form>
                </KeyboardAwareScrollView>
            </View>
        );
    },
}));

export default EditPatient;

async function submit(props, navigator, getInput) {
    const formData = props.tree.form.get();
    const validationResult = tv4.validateMultiple(formData, updatePatientSchema);

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

    const patientPk = props.patientCursor.data.get('id');
    const cursor = props.patientCursor;
    const result = await props.updatePatientService(patientPk, cursor, formData);

    if (result.status === 'Failure') {
        if (result.error.data.mrn) {
            getInput('mrn').showError(result.error.data.mrn);
            return;
        }

        Alert.alert(
            'Update Patient Error',
            JSON.stringify(result));
    } else {
        navigator.pop();
    }
}

export function getRoute(props, context) {
    let getInput;
    const navigator = props.navigator;
    const passProps = {
        registerGetInput: (_getInput) => { getInput = _getInput; },
        tree: props.tree,
        patientCursor: props.patientCursor,
        updatePatientService: context.services.updatePatientService,
        racesList: props.racesList,
    };

    const { firstName, lastName } = props.patientCursor.data.get();

    return {
        component: EditPatient,
        leftButtonTitle: 'Cancel',
        onLeftButtonPress: () => navigator.pop(),
        title: `${firstName} ${lastName}`,
        rightButtonTitle: 'Update',
        onRightButtonPress: () => submit(passProps, navigator, getInput),
        navigationBarHidden: false,
        tintColor: '#FF2D55',
        passProps,
    };
}
