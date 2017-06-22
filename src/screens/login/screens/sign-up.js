import React, { Component, PropTypes } from 'react';
import {
    Alert,
    View,
    StyleSheet,
} from 'react-native';
import { Input, Button, StartScreen, ClickableText } from 'components';
import tree from 'libs/tree';
import s from '../styles';

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
                <Input
                    label="First Name"
                    cursor={firstNameCursor}
                    returnKeyType="next"
                    inputWrapperStyle={s.inputWrapper}
                    inputStyle={s.input}
                />
                <Input
                    label="Last Name"
                    cursor={lastNameCursor}
                    returnKeyType="next"
                    inputWrapperStyle={s.inputWrapper}
                    inputStyle={s.input}
                />
                <Input
                    label="Email"
                    cursor={emailCursor}
                    returnKeyType="next"
                    inputWrapperStyle={s.inputWrapper}
                    inputStyle={s.input}
                />
                <Input
                    label="Password"
                    cursor={passwordCursor}
                    returnKeyType="done"
                    inputWrapperStyle={s.inputWrapper}
                    inputStyle={s.input}
                />
                <Button title="Sign Up" onPress={submit} />
                <View style={{ marginTop: 42 }}>
                    <ClickableText
                        onPress={this.goBack}
                        text="Already have an account? Login"
                        style={s.text}
                        clickableAreaStyles={s.clickableArea}
                    />
                </View>
            </StartScreen>
        );
    }
}
