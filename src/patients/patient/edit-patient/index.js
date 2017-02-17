import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    ScrollView,
    TouchableWithoutFeedback,
    Alert,
    ActivityIndicator,
} from 'react-native';
import _ from 'lodash';
import schema from 'libs/state';
import { Form, Input, Picker, DatePicker } from 'components';
import tv4 from 'tv4';
import s from './styles';

tv4.setErrorReporter((error, data, itemSchema) => itemSchema.message);

const updatePatientSchema = {
    title: 'Update patient form',
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
        mrn: {
            type: 'string',
            pattern: '^\\d+$',
            message: 'MRN should be an integer number',
            maxLength: 10,
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
            race: '',
            status: '',
        },
        offsetY: 0,
        datePickerCursor: {},
        racePickerCursor: {},
    },
};

const EditPatient = schema(model)(React.createClass({
    displayName: 'EditPatient',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        currentPatientCursor: BaobabPropTypes.cursor.isRequired,
        racesList: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        registerGetInput: React.PropTypes.func.isRequired,
    },

    componentWillMount() {
        const { firstname, lastname, mrn,
                sex, dob, race, status } = this.props.currentPatientCursor.data.get();
        this.props.tree.form.set({
            firstname,
            lastname,
            mrn,
            dob,
            sex,
            race,
            status,
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

    renderSex() {
        const sexCursor = this.props.tree.form.sex;
        const sex = sexCursor.get();

        return (
            <TouchableWithoutFeedback
                onPress={() => sexCursor.set(sex && sex === 'Male' ? 'Female' : 'Male')}
            >
                <View style={[s.wrapper, { flexDirection: 'row', alignItems: 'center' }]}>
                    <Text style={[s.groupTitle, { paddingTop: 7, paddingBottom: 8 }]}>Sex:</Text>
                    <Text style={s.groupText}>{sex}</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    },

    render() {
        const firstnameCursor = this.props.tree.form.firstname;
        const lastnameCursor = this.props.tree.form.lastname;
        const mrnCursor = this.props.tree.form.mrn;
        const raceCursor = this.props.tree.form.race;
        const dobCursor = this.props.tree.form.dob;
        const offsetY = this.props.tree.offsetY.get();

        const status = this.props.tree.form.get('status');
        const showLoader = status === 'Loading';

        return (
            <View style={s.container}>
                <ScrollView
                    onScroll={this.onScroll}
                    scrollEventThrottle={200}
                    ref={(ref) => { this.scrollView = ref; }}
                >
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
                        onSubmit={() => console.log('submit')} style={{ marginBottom: 40 }}
                    >
                        <View style={s.group}>
                            <View style={s.groupTitleWrapper}>
                                <Text style={s.groupTitle}>Patient name</Text>
                            </View>
                            <Input
                                label="First Name"
                                cursor={firstnameCursor}
                                inputWrapperStyle={s.wrapper}
                                inputStyle={s.input}
                                errorStyle={s.error}
                                placeholderTextColor="#ccc"
                                returnKeyType="next"
                                name="firstname"
                            />
                            <Input
                                label="Last Name"
                                cursor={lastnameCursor}
                                inputWrapperStyle={[s.wrapper, s.wrapperFull]}
                                inputStyle={s.input}
                                errorStyle={s.error}
                                placeholderTextColor="#ccc"
                                returnKeyType="next"
                                name="lastname"

                            />
                        </View>
                        <View style={s.group}>
                            <View style={s.groupTitleWrapper}>
                                <Text style={s.groupTitle}>Medical record number</Text>
                            </View>
                            <Input
                                label=""
                                cursor={mrnCursor}
                                inputWrapperStyle={[s.wrapper, s.wrapperFull]}
                                inputStyle={s.input}
                                errorStyle={s.error}
                                placeholderTextColor="#ccc"
                                returnKeyType="next"
                                keyboardType="numeric"
                                name="mrn"
                            />
                        </View>
                        <View style={s.group}>
                            <View style={s.groupTitleWrapper}>
                                <Text style={s.groupTitle}>Patient Information</Text>
                            </View>
                            <DatePicker
                                tree={this.props.tree.datePickerCursor}
                                cursor={dobCursor}
                                title="Date of Birth"
                                onPress={() => { this.scrollView.scrollTo({ y: offsetY + 220, animated: true }); }}
                            />
                            {this.renderSex()}
                            <Picker
                                tree={this.props.tree.racePickerCursor}
                                cursor={raceCursor}
                                items={this.props.racesList}
                                title="Race"
                                onPress={() => { this.scrollView.scrollTo({ y: offsetY + 220, animated: true }); }}
                            />
                        </View>
                    </Form>
                </ScrollView>
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
        return;
    }

    const patientPk = props.currentPatientCursor.data.get('id');
    const cursor = props.currentPatientCursor;
    const result = await props.updatePatientService(patientPk, cursor, formData);

    if (result.status === 'Failure') {
        Alert.alert(
            'Update Patient Error',
            JSON.stringify(result));
    } else {
        navigator.pop();
    }
}

export function getRoute(props, navigator) {
    let getInput;
    const passProps = {
        registerGetInput: (_getInput) => { getInput = _getInput; },
        tree: props.tree,
        currentPatientCursor: props.currentPatientCursor,
        updatePatientService: props.updatePatientService,
        racesList: props.racesList,
    };

    const { firstname, lastname } = props.currentPatientCursor.data.get();

    return {
        component: EditPatient,
        leftButtonTitle: 'Cancel',
        onLeftButtonPress: () => navigator.pop(),
        title: `${firstname} ${lastname}`,
        rightButtonTitle: 'Update',
        onRightButtonPress: () => submit(passProps, navigator, getInput),
        navigationBarHidden: false,
        tintColor: '#FF2D55',
        passProps,
    };
}
