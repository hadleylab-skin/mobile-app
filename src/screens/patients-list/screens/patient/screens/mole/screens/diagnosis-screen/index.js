import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    SafeAreaView,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { Input, Form } from 'components';
import tv4 from 'tv4';
import s from './styles';

tv4.setErrorReporter((error, data, itemSchema) => itemSchema.message);

const dignosisSchema = {
    type: 'object',
    properties: {
        text: {
            minLength: 2,
            message: 'too short',
        },
    },
    required: ['text'],
    message: 'required',
};

export const DiagnosisScreen = createReactClass({
    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
        title: PropTypes.string.isRequired,
        onSubmit: PropTypes.func.isRequired,
        text: PropTypes.string,
    },

    getInitialState() {
        return {
            isLoading: false,
        };
    },

    componentDidMount() {
        this.props.cursor.select('text').set(this.props.text);
    },

    onSubmit() {
        const { cursor } = this.props;
        const formData = cursor.get();

        const validationResult = tv4.validateMultiple(formData, dignosisSchema);

        if (!validationResult.valid) {
            const error = validationResult.errors[0];
            this.getInput('diagnosis').showError(error.message);
            this.getInput('diagnosis').focus();

            return;
        }

        this.setState({ isLoading: true });
        this.props.onSubmit();
    },

    getInput(name) {
        const getInput = this.form.getInput.bind(this.form);
        return getInput(name);
    },

    render() {
        const { cursor, title } = this.props;

        return (
            <SafeAreaView style={s.container}>
                <StatusBar barStyle="dark-content" />
                <View style={s.inner}>
                    <Form onSubmit={this.onSubmit} ref={(ref) => { this.form = ref; }}>
                        <Input
                            label={title}
                            cursor={cursor.select('text')}
                            returnKeyType="done"
                            inputWrapperStyle={s.inputWrapper}
                            inputStyle={s.input}
                            placeholderTextColor="rgba(0,0,0,0.5)"
                            name="diagnosis"
                        />
                    </Form>
                </View>
                <ActivityIndicator
                    animating={this.state.isLoading}
                    size="large"
                    color="#FF1D70"
                />
            </SafeAreaView>
        );
    },
});

export function getDiagnosisScreenRoute(props) {
    return {
        component: DiagnosisScreen,
        title: props.title,
        onLeftButtonPress: () => props.navigator.pop(),
        navigationBarHidden: false,
        leftButtonIcon: require('components/icons/back/back.png'),
        tintColor: '#FF1D70',
        passProps: props,
    };
}
