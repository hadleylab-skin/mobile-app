import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import _ from 'lodash';
import {
    Alert,
    View,
    Text,
    PickerIOS,
} from 'react-native';
import BaobabPropTypes from 'baobab-prop-types';
import { Input, Button, StartScreen,
         ClickableText, Form, Switch,
} from 'components';
import schema from 'libs/state';
import { handleFormSubmitError } from 'libs/form';
import { signUpService, signUpAsParticipantService } from 'services/auth';
import { getSitesService } from 'services/constants';
import s from '../styles';

const model = {
    tree: {
        form: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            site: '',
        },
        belongToGroup: false,
        isParticipantForm: false,
        picker: {},
        availableSites: {},
        result: {},
    },
};

const SignUp = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        navigator: PropTypes.object.isRequired, // eslint-disable-line
    },

    async componentWillMount() {
        this.props.tree.set(model.tree);
        const result = await getSitesService(this.props.tree.availableSites);
        const lastOption = _.last(result.data);
        if (lastOption) {
            this.props.tree.form.site.set(lastOption.pk);
        }
    },

    goBack() {
        this.props.navigator.pop();
    },

    async onSubmit() {
        let data = { ...this.props.tree.form.get() };
        if (this.props.tree.belongToGroup.get() === false) {
            data.site = null;
        }
        const isParticipantForm = this.props.tree.isParticipantForm.get();

        let result = null;
        if (isParticipantForm) {
            result = await signUpAsParticipantService(this.props.tree.result, data);
        } else {
            result = await signUpService(this.props.tree.result, data);
        }

        if (result.status === 'Failure') {
            handleFormSubmitError(result.error, this.form);
            return;
        }
        Alert.alert(
            'You have registered',
            'Please check your email and follow instruction',
            [{ text: 'OK', onPress: this.goBack }]
        );
    },

    getOptions() {
        const { status, data } = this.props.tree.availableSites.get();
        if (status !== 'Succeed') {
            return [];
        }
        return data;
    },

    renderBelongToGroupFields() {
        const siteCursor = this.props.tree.form.site;
        const pickerOptions = this.getOptions();
        const belongToGroupCursor = this.props.tree.belongToGroup;

        if (_.isEmpty(pickerOptions)) {
            return null;
        }
        return (
            <View>
                <Text style={s.label}>
                    REGISTER AS PART OF A CLINICAL SITE
                </Text>
                <View style={s.switchWrapper}>
                    <Switch
                        cursor={belongToGroupCursor}
                        theme="white"
                        items={[
                            { label: 'Yes', value: true },
                            { label: 'No', value: false },
                        ]}
                    />
                </View>
                {
                    (_.isEmpty(pickerOptions) || belongToGroupCursor.get() === false)
                ?
                    null
                :
                    <PickerIOS
                        itemStyle={{ color: '#fff' }}
                        selectedValue={siteCursor.get()}
                        onValueChange={(value) => siteCursor.set(value)}
                    >
                        {_.map(pickerOptions, ({ pk, title }) => (
                            <PickerIOS.Item
                                key={pk}
                                value={pk}
                                label={title}
                            />
                        ))}
                    </PickerIOS>
                }
            </View>
        );
    },

    render() {
        const firstNameCursor = this.props.tree.form.firstName;
        const lastNameCursor = this.props.tree.form.lastName;
        const emailCursor = this.props.tree.form.email;
        const passwordCursor = this.props.tree.form.password;
        const isParticipantFormCursor = this.props.tree.isParticipantForm;
        const isParticipantForm = isParticipantFormCursor.get();

        return (
            <StartScreen>
                <Form
                    ref={(ref) => { this.form = ref; }}
                    onSubmit={this.onSubmit}
                >
                    <View style={s.formSwitchWrapper}>
                        <Switch
                            cursor={isParticipantFormCursor}
                            theme="white"
                            items={[
                                { label: 'Researcher', value: false },
                                { label: 'Patient', value: true },
                            ]}
                        />
                    </View>

                    {!isParticipantForm ?
                        <View>
                            <Text style={s.label}>FIRST NAME</Text>
                            <Input
                                label="First Name"
                                name="firstName"
                                cursor={firstNameCursor}
                                returnKeyType="next"
                                inputWrapperStyle={s.inputWrapper}
                                inputStyle={s.input}
                                placeholderTextColor="rgba(255,255,255,0.7)"
                                errorStyle={s.error}
                                errorWrapperStyle={s.errorWrapper}
                                errorPlaceholderTextColor="#fff"
                            />
                        </View>
                    : null}

                    {!isParticipantForm ?
                        <View>
                            <Text style={s.label}>LAST NAME</Text>
                            <Input
                                label="Last Name"
                                name="lastName"
                                cursor={lastNameCursor}
                                returnKeyType="next"
                                inputWrapperStyle={s.inputWrapper}
                                inputStyle={s.input}
                                placeholderTextColor="rgba(255,255,255,0.7)"
                                errorStyle={s.error}
                                errorWrapperStyle={s.errorWrapper}
                                errorPlaceholderTextColor="#fff"
                            />
                        </View>
                    : null}

                    <Text style={s.label}>EMAIL</Text>
                    <Input
                        label="Email"
                        name="email"
                        cursor={emailCursor}
                        returnKeyType="next"
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        inputWrapperStyle={s.inputWrapper}
                        inputStyle={s.input}
                        placeholderTextColor="rgba(255,255,255,0.7)"
                        errorStyle={s.error}
                        errorWrapperStyle={s.errorWrapper}
                        errorPlaceholderTextColor="#fff"
                    />
                    <Text style={s.label}>PASSWORD</Text>
                    <Input
                        label="Password"
                        name="password"
                        cursor={passwordCursor}
                        secureTextEntry
                        inputWrapperStyle={s.inputWrapper}
                        inputStyle={s.input}
                        placeholderTextColor="rgba(255,255,255,0.7)"
                        errorStyle={s.error}
                        errorWrapperStyle={s.errorWrapper}
                        errorPlaceholderTextColor="#fff"
                    />
                    {!isParticipantForm ?
                        this.renderBelongToGroupFields()
                    : null}
                </Form>
                <View style={s.button}>
                    <Button title="Sign Up" onPress={this.onSubmit} type="white" />
                </View>
                <View style={{ marginTop: 42 }}>
                    <ClickableText
                        onPress={this.goBack}
                        text="Already have an account? Login"
                        style={s.text}
                        clickableAreaStyles={s.clickableArea}
                    />
                </View>
            </StartScreen>
        );
    },
}));

export function getSignUpRoute(props) {
    return {
        component: SignUp,
        title: 'SignUp',
        navigationBarHidden: true,
        passProps: {
            tree: props.tree.signUp,
        },
    };
}
