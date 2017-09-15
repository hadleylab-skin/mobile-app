import React, { PropTypes } from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    Alert,
    View,
    Text,
    NavigatorIOS,
} from 'react-native';
import { Input, Button, StartScreen, ClickableText, Form } from 'components';
import tree from 'libs/tree';
import schema from 'libs/state';
import { loginService } from 'services/login';
import { getKeyPairStatus } from 'services/keypair';
import ResetPassword from './screens/reset-password';
import SignUp from './screens/sign-up';
import s from './styles';

const route = {
    title: 'Login',
    navigationBarHidden: true,
};

const SignInComponent = React.createClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired,
    },

    async submit() {
        const result = await loginService(this.props.tokenCursor, this.props.tree.get());

        if (result.status === 'Failure') {
            Alert.alert(
                'Login',
                'Wrong email or password');
        }
        getKeyPairStatus(
            this.props.keyPairStatusCursor,
            result.data.doctor.data,
            this.props.tree.get('password'));
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
                    <Text style={s.label}>EMAIL</Text>
                    <Input
                        label="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                        autoCorrect={false}
                        cursor={usernameCursor}
                        inputWrapperStyle={s.inputWrapper}
                        inputStyle={s.input}
                        placeholderTextColor="rgba(255,255,255,0.7)"
                    />
                    <Text style={s.label}>PASSWORD</Text>
                    <Input
                        label="Password"
                        returnKeyType="done"
                        cursor={passwordCursor}
                        inputWrapperStyle={s.inputWrapper}
                        inputStyle={s.input}
                        secureTextEntry
                        placeholderTextColor="rgba(255,255,255,0.7)"
                    />
                </Form>
                <View style={s.button}>
                    <Button title="Login" onPress={this.submit} type="white" />
                </View>
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
            username: 'ir4y.ix@gmail.com',
            password: '1q2w3e4r5t6y',
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
                        keyPairStatusCursor: this.props.keyPairStatusCursor,
                    },
                }}
                style={{ flex: 1 }}
            />
        );
    }
}
