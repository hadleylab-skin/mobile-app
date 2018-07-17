import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    SafeAreaView,
} from 'react-native';
import { Input, Form } from 'components';
import tv4 from 'tv4';
import s from './styles';

tv4.setErrorReporter((error, data, itemSchema) => itemSchema.message);

const emailSchema = {
    type: 'string',
    pattern: "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
    message: 'Wrong email format',
};

export const EmailScreen = createReactClass({
    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
        onSubmit: PropTypes.func.isRequired,
        text: PropTypes.string,
    },

    componentDidMount() {
        this.props.cursor.set(this.props.text);
    },

    onSubmit() {
        const { cursor } = this.props;
        const formData = cursor.get();

        const validationResult = tv4.validateMultiple(formData, emailSchema);

        if (!validationResult.valid) {
            const error = validationResult.errors[0];
            this.getInput('email').showError(error.message);
            this.getInput('email').focus();

            return;
        }

        this.props.onSubmit();
    },

    getInput(name) {
        const getInput = this.form.getInput.bind(this.form);
        return getInput(name);
    },

    render() {
        const { cursor } = this.props;

        return (
            <SafeAreaView style={s.container}>
                <View style={s.inner}>
                    <Form onSubmit={this.onSubmit} ref={(ref) => { this.form = ref; }}>
                        <Input
                            label="person@mail.com"
                            cursor={cursor}
                            returnKeyType="done"
                            inputWrapperStyle={s.inputWrapper}
                            inputStyle={s.input}
                            placeholderTextColor="rgba(0,0,0,0.5)"
                            autoCapitalize="none"
                            name="email"
                        />
                    </Form>
                </View>
            </SafeAreaView>
        );
    },
});

export function getEmailScreenRoute(props, context) {
    return {
        component: EmailScreen,
        title: 'Email',
        onLeftButtonPress: () => context.mainNavigator.pop(),
        navigationBarHidden: false,
        leftButtonIcon: require('components/icons/back/back.png'),
        tintColor: '#FF1D70',
        passProps: props,
    };
}
