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
        'Reset password',
        'Wrong email');
}

const route = {
    title: 'Login',
    navigationBarHidden: true,
}

export default class ResetPassword extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
    }

    goBack = () => {
        this.props.navigator.pop()
    }

    render() {
        const emailCursor = tree.email;

        return (
            <StartScreen>
                <Input label="Email" cursor={emailCursor} />
                <Button title="Reset" onPress={submit} />
                <AppText style={styles.text}>
                    <Text onPress={this.goBack}>Back</Text>
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
