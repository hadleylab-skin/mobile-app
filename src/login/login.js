import React, { PropTypes } from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    Alert,
    View,
    NavigatorIOS,
} from 'react-native';
import { Input, Button, StartScreen, ClickableText, Form } from 'components';
import tree from 'libs/tree';
import schema from 'libs/state';
import { loginService } from 'libs/services/login';
import ResetPassword from './reset-password';
import SignUp from './sign-up';
import s from './styles';

const route = {
    title: 'Login',
    navigationBarHidden: true,
};

const SignInComponent = React.createClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
    },

    async submit() {
        const result = await loginService(this.props.tokenCursor, this.props.tree.get());

        if (result.status === 'Failure') {
            Alert.alert(
                'Login',
                'Wrong email or password');
        }
    },

    goToSignUp() {
        this.props.navigator.push(_.merge({}, route, { component: SignUp }));
    },

    goToResetPassword() {
        this.props.navigator.push(_.merge({}, route, { component: ResetPassword }));
    },

    render() {
        const usernameCursor = this.props.tree.username;
        const passwordCursor = this.props.tree.password;

        return (
            <StartScreen>
                <Form onSubmit={this.submit}>
                    <Input
                        label="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                        cursor={usernameCursor}
                        inputWrapperStyle={s.inputWrapper}
                        inputStyle={s.input}
                    />
                    <Input
                        label="Password"
                        returnKeyType="done"
                        cursor={passwordCursor}
                        inputWrapperStyle={s.inputWrapper}
                        inputStyle={s.input}
                        secureTextEntry
                    />
                </Form>
                <Button title="Login" onPress={this.submit} />
                {/*
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
                */}
            </StartScreen>
        );
    },
});

function SignInScreen(props) {
    const model = {
        tree: {
            username: '',
            password: '',
        },
    };
    const loginScreenCursor = tree.login;
    const Component = schema(model)(SignInComponent);
    return (
        <Component
            {...props}
            tree={loginScreenCursor}
            tokenCursor={props.tokenCursor}
        />
    );
}

export class Login extends React.Component {
    render() {
        return (
            <NavigatorIOS
                initialRoute={{
                    component: SignInScreen,
                    title: 'Login',
                    navigationBarHidden: true,
                    passProps: {
                        tree: this.props.tree,
                        tokenCursor: this.props.tokenCursor,
                    },
                }}
                style={{ flex: 1 }}
            />
        );
    }
}
