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

const route = {
    title: 'Login',
    navigationBarHidden: true,
};

export default function (props) {
    const model = {
        loginScreenCursor: {
            email: '',
            password: '',
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
        const data = {
            email: this.props.tree.email.get(),
            password: this.props.tree.password.get(),
        };
        const result = await loginService(this.props.tokenCursor, data);

        Alert.alert(
            'Login',
            JSON.stringify(result));
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
        console.log(tree.get());

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
