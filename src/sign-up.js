import React, { Component, PropTypes } from 'react';
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
    static propTypes = {
        navigator: PropTypes.object.isRequired,
    }

    goBack = () => {
        this.props.navigator.pop()
    }

    render() {
        const firstNameCursor = tree.firstName;
        const lastNameCursor = tree.lastName;
        const emailCursor = tree.email;
        const passwordCursor = tree.password;

        return (
            <StartScreen>
                <Input label="First Name" cursor={firstNameCursor} returnKeyType="next" />
                <Input label="Last Name" cursor={lastNameCursor} returnKeyType="next" />
                <Input label="Email" cursor={emailCursor} returnKeyType="next" />
                <Input label="Password" cursor={passwordCursor} returnKeyType="done" />
                <Button title="Sign Up" onPress={submit} />
                <AppText
                    style={styles.text}
                    onPress={this.goBack}
                >
                    Already have an account?
                    {' '}
                    Login
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
