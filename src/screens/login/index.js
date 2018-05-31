import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    NavigatorIOS,
} from 'react-native';
import { Input, Button, StartScreen, ClickableText, Form } from 'components';
import schema from 'libs/state';
import { handleFormSubmitError } from 'libs/form';
import { loginService } from 'services/auth';
import { getKeyPairStatus } from 'services/keypair';
import { getResetPasswordRoute, getSignUpRoute } from './screens';
import s from './styles';

const model = {
    tree: {
        form: {
            username: '',
            password: '',
        },
        signUp: {},
        resetPassword: {},
    },
};

const Login = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired, // eslint-disable-line
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired, // eslint-disable-line
        navigator: PropTypes.object.isRequired, // eslint-disable-line
    },

    async submit() {
        const result = await loginService(this.props.tokenCursor, this.props.tree.form.get());

        if (result.status === 'Failure') {
            handleFormSubmitError(result.error, this.form);
            return;
        }
        getKeyPairStatus(
            this.props.keyPairStatusCursor,
            result.data.doctor.data,
            this.props.tree.form.get('password'));
    },

    goToSignUp() {
        this.props.navigator.push(getSignUpRoute(this.props));
    },

    goToResetPassword() {
        this.props.navigator.push(getResetPasswordRoute(this.props));
    },

    render() {
        const usernameCursor = this.props.tree.form.username;
        const passwordCursor = this.props.tree.form.password;

        return (
            <StartScreen>
                <Form
                    ref={(ref) => { this.form = ref; }}
                    onSubmit={this.submit}
                >
                    <Text style={s.label}>EMAIL</Text>
                    <Input
                        label="Email"
                        name="username"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                        autoCorrect={false}
                        cursor={usernameCursor}
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
                        returnKeyType="done"
                        cursor={passwordCursor}
                        inputWrapperStyle={s.inputWrapper}
                        inputStyle={s.input}
                        secureTextEntry
                        placeholderTextColor="rgba(255,255,255,0.7)"
                        errorStyle={s.error}
                        errorWrapperStyle={s.errorWrapper}
                        errorPlaceholderTextColor="#fff"
                    />
                </Form>
                <View style={s.button}>
                    <Button title="Login" onPress={this.submit} type="white" />
                </View>
                <View style={{ marginTop: 42 }}>
                    <ClickableText
                        onPress={this.goToSignUp}
                        text="Sign Up"
                        style={s.text}
                        clickableAreaStyles={s.clickableArea}
                    />
                    <ClickableText
                        onPress={this.goToResetPassword}
                        text="Forgot you password?"
                        style={s.text}
                        clickableAreaStyles={s.clickableArea}
                    />
                </View>
            </StartScreen>
        );
    },
}));

export const LoginScreen = createReactClass({
    render() {
        return (
            <NavigatorIOS
                initialRoute={{
                    component: Login,
                    title: 'Login',
                    navigationBarHidden: true,
                    passProps: { ...this.props },
                }}
                style={{ flex: 1 }}
            />
        );
    },
});
