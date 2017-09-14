import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    Alert,
    View,
    Text,
    Image,
    ScrollView,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import _ from 'lodash';
import schema from 'libs/state';
import tv4 from 'tv4';
import {
    ScanMrnButton, Button, Title, Form, Input,
    DatePicker, InfoField, Switch, Picker,
} from 'components';
import ImagePicker from 'react-native-image-picker';
import { getSignatureRoute } from 'screens/signature';
import defaultUserImage from 'components/icons/empty-photo/empty-photo.png';
import { getMrnScreenRoute } from './screens/mrn-screen';
import { getAgreementRoute } from './screens/agreement';
import s from './styles';

tv4.setErrorReporter((error, data, itemSchema) => itemSchema.message);

const submitPatientSchema = {
    type: 'object',
    properties: {
        firstName: {
            minLength: 2,
            message: 'too short',
        },
        lastName: {
            minLength: 2,
            message: 'too short',
        },
    },
    required: ['firstName', 'lastName'],
    message: 'required',
};

const model = {
    tree: {
        form: {
            firstName: '',
            lastName: '',
            mrn: '',
            dateOfBirth: null,
            photo: {},
            sex: 'm',
            race: '',
        },
        scanResult: { status: 'NotAsked' },
        datePicker: {},
        racePicker: {},
        mrn: '',
    },
};

const CreateOrEditPatient = schema(model)(React.createClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        dataCursor: BaobabPropTypes.cursor,
        service: React.PropTypes.func.isRequired,
        onActionComplete: React.PropTypes.func.isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        cursors: React.PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            racesList: BaobabPropTypes.cursor.isRequired,
        }),
    },

    getInitialState() {
        return {
            offsetY: 0,
        };
    },

    componentWillMount() {
        const { dataCursor } = this.props;

        if (this.isCreateMode()) {
            this.props.tree.form.set({
                firstName: '',
                lastName: '',
                mrn: '',
                dateOfBirth: null,
                photo: {},
                sex: 'm',
                race: '',
            });

            return;
        }

        const { firstName, lastName, mrn,
            photo, dateOfBirth, sex, race } = dataCursor.get();

        this.props.tree.form.set({
            firstName,
            lastName,
            mrn,
            photo,
            dateOfBirth,
            race,
            sex: sex || 'm',
        });
    },

    isCreateMode() {
        const { dataCursor } = this.props;
        return !dataCursor || _.isEmpty(dataCursor.get());
    },

    setupData(data) {
        _.each(data, (value, key) => {
            if (value) {
                this.props.tree.form.select(key).set(value);
            }
        });
    },

    async onSubmit() {
        const formData = this.props.tree.form.get();

        const validationResult = tv4.validateMultiple(formData, submitPatientSchema);

        if (!validationResult.valid) {
            _.each(
                validationResult.errors,
                (error) => {
                    const errorMessage = error.message;
                    const fieldName = error.params.key || error.dataPath.substr(1);

                    this.getInput(fieldName).showError(errorMessage);
                });

            const firstError = validationResult.errors[0];
            const firstErrorPath = firstError.params.key || firstError.dataPath.substr(1);
            this.getInput(firstErrorPath).focus();

            return;
        }

        if (this.isCreateMode()) {
            this.props.navigator.push(
                getAgreementRoute({
                    navigator: this.props.navigator,
                    onAgree: () => this.props.navigator.push(
                        getSignatureRoute({
                            navigator: this.props.navigator,
                            onSave: async (signatureData) => {
                                const formDataWithSignature = _.merge(
                                    {},
                                    formData,
                                    { signature: signatureData.encoded });

                                await this.saveAndCallback(formDataWithSignature);
                            },
                        })),
                })
            );
        } else {
            await this.saveAndCallback(formData);
        }
    },

    async saveAndCallback(formData) {
        const { service, onActionComplete } = this.props;

        const doctors = this.props.dataCursor ? this.props.dataCursor.doctors.get() : [];
        const result = await service(this.props.tree, { doctors, ...formData });

        if (result.status === 'Succeed') {
            onActionComplete(result.data.pk);
        } else {
            const mrnError = _.join(result.error.data.mrnHash || [], ',');
            if (mrnError) {
                Alert.alert('Save Error', mrnError);
            } else {
                Alert.alert('Server Error', JSON.stringify(result.error));
            }
        }
    },

    getInput(name) {
        const getInput = this.form.getInput.bind(this.form);
        return getInput(name);
    },

    onScroll(e) {
        const offsetY = e.nativeEvent.contentOffset.y;
        this.setState({ offsetY });
    },

    render() {
        const { offsetY } = this.state;
        const formCursor = this.props.tree.form;
        const photoCursor = formCursor.select('photo');
        const firstNameCursor = formCursor.select('firstName');
        const lastNameCursor = formCursor.select('lastName');
        const dateOfBirthCursor = formCursor.select('dateOfBirth');
        const sexCursor = formCursor.select('sex');
        const raceCursor = formCursor.select('race');
        const mrnCursor = this.props.tree.form.mrn;
        const isLoading = this.props.tree.get('status') === 'Loading';

        const photo = photoCursor.get();

        return (
            <View style={s.container}>
                {isLoading ?
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating
                            size="large"
                            color="#FF1D70"
                        />
                    </View>
                : null}
                <ScrollView
                    onScroll={this.onScroll}
                    style={s.inner}
                    ref={(ref) => { this.scrollView = ref; }}
                >
                    <Form
                        ref={(ref) => { this.form = ref; }}
                        onSubmit={this.onSubmit}
                        style={s.form}
                    >
                        <View style={s.button}>
                            <ScanMrnButton
                                cursor={this.props.tree.scanResult}
                                setupData={this.setupData}
                            />
                        </View>
                        <View style={s.generalInfo}>
                            <View style={s.photoWrapper}>
                                <TouchableWithoutFeedback
                                    onPress={() => ImagePicker.showImagePicker({}, (response) => {
                                        if (response.uri) {
                                            photoCursor.select('thumbnail').set(response.uri);
                                        }
                                    })}
                                >
                                    <View style={{ alignItems: 'center' }}>
                                        <Image
                                            style={s.photo}
                                            source={!_.isEmpty(photo) ? { uri: photo.thumbnail } : defaultUserImage}
                                        />
                                        {!_.isEmpty(photo) ?
                                            <Text style={s.text}>edit</Text>
                                        : null}
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                            <View style={s.name}>
                                <Input
                                    label={'First Name'}
                                    cursor={firstNameCursor}
                                    returnKeyType="next"
                                    inputWrapperStyle={s.hasBottomBorder}
                                    errorWrapperStyle={s.errorFirstName}
                                    inputStyle={[s.input, s.inputFirstName]}
                                    placeholderTextColor="#ACB5BE"
                                    erroPlaceholderTextColor="#FC3159"
                                    name="firstName"
                                    onFocus={() => this.scrollView.scrollTo({ x: 0, y: -64, animated: true })}
                                />
                                <Input
                                    label={'Last Name'}
                                    cursor={lastNameCursor}
                                    inputStyle={s.input}
                                    errorWrapperStyle={s.error}
                                    placeholderTextColor="#ACB5BE"
                                    erroPlaceholderTextColor="#FC3159"
                                    name="lastName"
                                    onFocus={() => this.scrollView.scrollTo({ x: 0, y: -64, animated: true })}
                                />
                            </View>
                        </View>
                        <Title text="Patient Information" />
                        <InfoField
                            title={'Medical Record Number'}
                            text={mrnCursor.get()}
                            hasNoBorder
                            onPress={() =>
                                this.context.mainNavigator.push(
                                    getMrnScreenRoute({
                                        cursor: this.props.tree.select('mrn'),
                                        text: mrnCursor.get(),
                                        onSubmit: () => {
                                            mrnCursor.set(this.props.tree.get('mrn'));
                                            this.context.mainNavigator.pop();
                                        },
                                    }, this.context)
                                )
                            }
                        />
                        <DatePicker
                            tree={this.props.tree.datePicker}
                            cursor={dateOfBirthCursor}
                            title="Date of Birth"
                            onPress={() => this.scrollView.scrollTo({ x: 0, y: offsetY + 220, animated: true })}
                        />
                        <InfoField
                            title={'Sex'}
                            controls={
                                <Switch
                                    cursor={sexCursor}
                                    items={[
                                        { label: 'Male', value: 'm' },
                                        { label: 'Female', value: 'f' },
                                    ]}
                                />
                            }
                        />
                        <Picker
                            tree={this.props.tree.racePicker}
                            cursor={raceCursor}
                            items={this.context.cursors.racesList.data.get()}
                            title="Race"
                            onPress={() => this.scrollView.scrollTo({ x: 0, y: offsetY + 220, animated: true })}
                        />
                    </Form>
                </ScrollView>
                <View style={s.footer}>
                    <Button
                        disabled={isLoading}
                        type="rect"
                        title={this.isCreateMode() ? 'Continue to patient consent' : 'Save changes'}
                        onPress={this.onSubmit}
                    />
                </View>
            </View>
        );
    },
}));

export function getCreateOrEditPatientRoute(props, context) {
    return {
        component: CreateOrEditPatient,
        leftButtonTitle: 'Cancel',
        onLeftButtonPress: () => context.mainNavigator.pop(),
        title: props.title,
        navigationBarHidden: false,
        tintColor: '#FF2D55',
        passProps: props,
    };
}
