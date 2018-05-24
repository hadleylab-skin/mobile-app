import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    View,
} from 'react-native';
import { Input, Form } from 'components';
import tv4 from 'tv4';
import s from './styles';

tv4.setErrorReporter((error, data, itemSchema) => itemSchema.message);

const mrnSchema = {
    type: 'string',
    pattern: '^\\d+$',
    message: 'Should be an integer number, less than 10 digits',
    maxLength: 9,
};

export const MrnScreen = createReactClass({
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

        const validationResult = tv4.validateMultiple(formData, mrnSchema);

        if (!validationResult.valid) {
            const error = validationResult.errors[0];
            this.getInput('mrn').showError(error.message);
            this.getInput('mrn').focus();

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
            <View style={s.container}>
                <View style={s.inner}>
                    <Form onSubmit={this.onSubmit} ref={(ref) => { this.form = ref; }}>
                        <Input
                            label="Medical Record Number"
                            cursor={cursor}
                            returnKeyType="done"
                            inputWrapperStyle={s.inputWrapper}
                            inputStyle={s.input}
                            placeholderTextColor="rgba(0,0,0,0.5)"
                            name="mrn"
                        />
                    </Form>
                </View>
            </View>
        );
    },
});

export function getMrnScreenRoute(props, context) {
    return {
        component: MrnScreen,
        title: 'Medical Record Number',
        onLeftButtonPress: () => context.mainNavigator.pop(),
        navigationBarHidden: false,
        leftButtonIcon: require('components/icons/back/back.png'),
        tintColor: '#FF1D70',
        passProps: props,
    };
}
