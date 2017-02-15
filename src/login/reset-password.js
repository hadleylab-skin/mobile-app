import React, { Component, PropTypes } from 'react';
import {
    Alert,
    View,
    StyleSheet,
} from 'react-native';
import { Input, Button, StartScreen, ClickableText } from 'components';
import tree from 'libs/tree';
import s from './styles';

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
                <Input
                    label="Email"
                    cursor={emailCursor}
                    inputWrapperStyle={s.inputWrapper}
                    inputStyle={s.input}
                />
                <Button title="Reset" onPress={submit} />
                <View style={{ marginTop: 42 }}>
                    <ClickableText
                        onPress={this.goBack}
                        text="Back"
                        style={s.text}
                        clickableAreaStyles={s.clickableArea}
                    />
                </View>
            </StartScreen>
        );
    }
}
