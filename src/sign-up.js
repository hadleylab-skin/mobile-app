import React, { Component } from 'react';
import {
    Alert,
    Text,
    StyleSheet,
} from 'react-native';
import { Input, Button, StartScreen, AppText } from 'components';
import tree from 'libs/tree';

function submit() {
    Alert.alert(
        'Sign Up',
        'Something went wrong');
}

export default class SignUp extends Component {
    render() {
        const firstNameCursor = tree.firstName;
        const lastNameCursor = tree.lastName;
        const emailCursor = tree.email;
        const passwordCursor = tree.password;

        return (
            <StartScreen>
                <Input label="First Name" cursor={firstNameCursor} />
                <Input label="Last Name" cursor={lastNameCursor} />
                <Input label="Email" cursor={emailCursor} />
                <Input label="Password" cursor={passwordCursor} />
                <Button title="Sign Up" onPress={submit} />
                <AppText style={styles.text}>
                    Already have an account?
                    {' '}
                    <Text onPress={() => console.log('To login screen')}>Login</Text>
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
        marginTop: 50,
    },
});
