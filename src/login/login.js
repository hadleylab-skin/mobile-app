import React, { PropTypes } from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    Alert,
    Text,
    StyleSheet,
} from 'react-native';
import { Input, Button, StartScreen, AppText } from 'components';
import tree from 'libs/tree';
import schema from 'libs/state';
import { loginService } from 'libs/services/login';
import ResetPassword from './reset-password';
import SignUp from './sign-up';
import Patients from '../patients';

const route = {
    title: 'Login',
    navigationBarHidden: true,
};

export function Login(props) {
    const model = {
        tree: {
            email: 'ir4y.ix@gmail.com',
            password: '123',
        },
    };
    const tokenCursor = tree.token;
    const loginScreenCursor = tree.login;
    const Component = schema(model)(SignIn);
    return (
        <Component
            {...props}
            tree={loginScreenCursor}
            tokenCursor={tokenCursor}
        />
    );
}

const SignIn = React.createClass({
    propTypes: {
        navigator: PropTypes.object.isRequired,
        tree: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
    },

    async submit() {
        const result = await loginService(this.props.tokenCursor, this.props.tree.get());

        if (result.status === 'Failure') {
            Alert.alert(
                'Login',
                JSON.stringify(result));
        } else {
            this.props.navigator.replace({ component: Patients, title: 'Patients', navigationBarHidden: false });
        }
    },

    goToSignUp() {
        this.props.navigator.push(_.merge({}, route, { component: SignUp }));
    },

    goToResetPassword() {
        this.props.navigator.push(_.merge({}, route, { component: ResetPassword }));
    },

    render() {
        const emailCursor = this.props.tree.email;
        const passwordCursor = this.props.tree.password;

        return (
            <StartScreen>
                <Input label="Email" cursor={emailCursor} />
                <Input label="Password" cursor={passwordCursor} />
                <Button title="Login" onPress={this.submit} />
                <AppText style={[styles.text, { marginTop: 50 }]}>
                    <Text onPress={this.goToSignUp}>Sign Up</Text>
                </AppText>
                <AppText style={[styles.text, { marginTop: 15 }]}>
                    <Text onPress={this.goToResetPassword}>Forgot you password?</Text>
                </AppText>
            </StartScreen>
        );
    },
});

const styles = StyleSheet.create({
    text: {
        color: '#fff',
        fontSize: 12,
        lineHeight: 12,
    },
});