import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    Text,
    Alert,
    View,
} from 'react-native';
import { Input, Button, StartScreen, ClickableText, Form } from 'components';
import { resetPasswordSerice } from 'services/auth';
import schema from 'libs/state';
import { handleFormSubmitError } from 'libs/form';
import s from '../styles';


const model = {
    tree: {
        form: {
            email: '',
        },
        result: {
        },
    },
};

const ResetPassword = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        navigator: PropTypes.object.isRequired, // eslint-disable-line
    },

    componentWillMount() {
        this.props.tree.set(model.tree);
    },

    goBack() {
        this.props.navigator.pop();
    },

    async onSubmit() {
        const result = await resetPasswordSerice(
            this.props.tree.result,
            this.props.tree.form.get());

        if (result.status === 'Succeed') {
            Alert.alert(
                'You password was reseted',
                'Please check your email and follow instruction',
                [{ text: 'OK', onPress: this.goBack }]
            );
            return;
        }
        handleFormSubmitError(result.error, this.form, () => 'email');
    },

    render() {
        const emailCursor = this.props.tree.form.email;

        return (
            <StartScreen>
                <Form
                    ref={(ref) => { this.form = ref; }}
                    onSubmit={this.onSubmit}
                >
                    <Text style={s.label}>EMAIL</Text>
                    <Input
                        label="Email"
                        name="email"
                        cursor={emailCursor}
                        inputWrapperStyle={s.inputWrapper}
                        inputStyle={s.input}
                        returnKeyType="done"
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        placeholderTextColor="rgba(255,255,255,0.7)"
                        errorStyle={s.error}
                        errorWrapperStyle={s.errorWrapper}
                        errorPlaceholderTextColor="#fff"
                    />
                </Form>
                <View style={s.button}>
                    <Button title="Reset" onPress={this.onSubmit} type="white" />
                </View>
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
    },
}));

export function getResetPasswordRoute(props) {
    return {
        component: ResetPassword,
        title: 'Reset Password',
        navigationBarHidden: true,
        passProps: {
            tree: props.tree.resetPassword,
        },
    };
}
