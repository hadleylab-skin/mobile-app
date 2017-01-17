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
        'Reset password',
        'Wrong email');
}

export default class ResetPassword extends Component {
    render() {
        const emailCursor = tree.email;

        return (
            <StartScreen>
                <Input label="Email" cursor={emailCursor} />
                <Button title="Reset" onPress={submit} />
                <AppText style={styles.text}>
                    <Text onPress={() => console.log('Back to login screen')}>Back</Text>
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
