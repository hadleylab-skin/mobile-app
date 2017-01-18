import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import {
    Alert,
    Text,
    StyleSheet,
    View,
} from 'react-native';
import { Input, Button, StartScreen, AppText } from 'components';
import tree from 'libs/tree';
import ResetPassword from './reset-password';
import SignUp from './sign-up';

const route = {
    title: 'Login',
    navigationBarHidden: true,
}

export default class SignIn extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
    }

    submit = () => {
        Alert.alert(
            'Login',
            'Wrong email or password');
    }

    goToSignUp = () => {
        this.props.navigator.push(_.merge({}, route, { component: SignUp }));
    }

    goToResetPassword = () => {
        this.props.navigator.push(_.merge({}, route, { component: ResetPassword }));
    }

    render() {
        const emailCursor = tree.email;
        const passwordCursor = tree.password;

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
    }
}

const styles = StyleSheet.create({
    text: {
        color: '#fff',
        fontSize: 12,
        lineHeight: 12,
    },
});
