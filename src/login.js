import React, { Component } from 'react';
import {
    Alert,
    Text,
    StyleSheet,
    View,
} from 'react-native';
import { Input, Button, StartScreen, AppText } from 'components';
import tree from 'libs/tree';

function submit() {
    Alert.alert(
        'Login',
        'Wrong email or password');
}

export default class SignIn extends Component {
    render() {
        const emailCursor = tree.email;
        const passwordCursor = tree.password;

        return (
            <StartScreen>
                <Input label="Email" cursor={emailCursor} />
                <Input label="Password" cursor={passwordCursor} />
                <Button title="Login" onPress={submit} />
                <AppText style={[styles.text, { marginTop: 50 }]}>
                    <Text onPress={() => console.log('To sign up screen')}>Sign Up</Text>
                </AppText>
                <AppText style={[styles.text, { marginTop: 15 }]}>
                    <Text onPress={() => console.log('To reset password screen')}>Forgot you password?</Text>
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
