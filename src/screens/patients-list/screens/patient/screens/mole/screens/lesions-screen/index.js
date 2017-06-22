import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    ActivityIndicator,
} from 'react-native';
import { Input, Form } from 'components';
import { convertCmToIn } from 'libs/misc';
import tv4 from 'tv4';
import s from './styles';

tv4.setErrorReporter((error, data, itemSchema) => itemSchema.message);

const lesionsInchSchema = {
    type: 'object',
    properties: {
        width: {
            pattern: '^\\d+(\\.\\d+)?$',
            message: 'Should be a number from 0 to 6 in',
        },
        height: {
            pattern: '^\\d+(\\.\\d+)?$',
            message: 'Should be a number from 0 to 6 in',
        },
    },
    required: ['width', 'height'],
    message: 'required',
};

const lesionsCmSchema = {
    type: 'object',
    properties: {
        width: {
            pattern: '^\\d+(\\.\\d+)?$',
            message: 'Should be a number from 0 to 15 cm',
        },
        height: {
            pattern: '^\\d+(\\.\\d+)?$',
            message: 'Should be a number from 0 to 15 cm',
        },
    },
    required: ['width', 'height'],
    message: 'required',
};

const LesionsScreen = React.createClass({
    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
        data: React.PropTypes.shape({
            width: React.PropTypes.string,
            height: React.PropTypes.string,
        }),
        onSubmit: React.PropTypes.func.isRequired,
    },

    contextTypes: {
        user: BaobabPropTypes.cursor.isRequired,
    },

    getInitialState() {
        return {
            isLoading: false,
        };
    },

    componentWillMount() {
        this.context.user.on('update', this.update);
    },

    componentDidMount() {
        this.convertUnits();
    },

    componentWillUnmount() {
        this.context.user.off('update', this.update);
    },

    update() {
        this.forceUpdate();
        this.convertUnits();
    },

    convertUnits() {
        let width = (this.props.data && this.props.data.width) || '';
        let height = (this.props.data && this.props.data.height) || '';
        const unitsOfLength = this.context.user.get('unitsOfLength');

        if (width && height) {
            if (unitsOfLength === 'in') {
                width = convertCmToIn(width);
                height = convertCmToIn(height);
            } else {
                width = `${parseFloat(width).toFixed(2)}`;
                height = `${parseFloat(height).toFixed(2)}`;
            }
        }

        this.props.cursor.select('width').set(width);
        this.props.cursor.select('height').set(height);
    },

    validate() {
        const { cursor } = this.props;
        const formData = cursor.get();
        const unitsOfLength = this.context.user.get('unitsOfLength');

        const validationResult = tv4.validateMultiple(formData,
            unitsOfLength === 'in' ? lesionsInchSchema : lesionsCmSchema);

        if (!validationResult.valid) {
            _.each(
                validationResult.errors,
                (error) => {
                    const errorMessage = error.message;
                    const fieldName = error.params.key || error.dataPath.substr(1);

                    this.getInput(fieldName).showError(errorMessage);
                });

            const firstError = validationResult.errors[0];
            const firstErrorPath = firstError.params.key || firstError.dataPath.substr(1);
            this.getInput(firstErrorPath).focus();

            return false;
        }

        const dataFields = ['width', 'height'];
        let errorsResult = { valid: true, errors: [] };

        _.each(
            dataFields,
            (field) => {
                if (unitsOfLength === 'in') {
                    const message = 'Should be a number from 0 to 6 in';

                    if (formData[field] > 6) {
                        errorsResult.errors.push({ key: field, message });
                        errorsResult.valid = false;
                    }
                }

                const message = 'Should be a number from 0 to 15 cm';

                if (formData[field] > 15) {
                    errorsResult.errors.push({ key: field, message });
                    errorsResult.valid = false;
                }
            });

        if (!errorsResult.valid) {
            _.each(
                errorsResult.errors,
                (error) => {
                    this.getInput(error.key).showError(error.message);
                });

            const firstError = errorsResult.errors[0];
            this.getInput(firstError.key).focus();

            return false;
        }

        return true;
    },

    onSubmit() {
        const isValid = this.validate();

        if (!isValid) {
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
        const { cursor } = this.props;
        const unitsOfLength = this.context.user.get('unitsOfLength');

        return (
            <View style={s.container}>
                <View style={s.inner}>
                    <Form onSubmit={this.onSubmit} ref={(ref) => { this.form = ref; }}>
                        <Text style={s.label}>WIDTH ({unitsOfLength})</Text>
                        <Input
                            label={'width'}
                            cursor={cursor.select('width')}
                            returnKeyType="next"
                            inputWrapperStyle={s.hasBottomBorder}
                            inputStyle={s.input}
                            placeholderTextColor="rgba(0,0,0,0.5)"
                            name="width"
                        />
                        <Text style={s.label}>HEIGHT ({unitsOfLength})</Text>
                        <Input
                            label={'height'}
                            cursor={cursor.select('height')}
                            returnKeyType="done"
                            inputStyle={s.input}
                            placeholderTextColor="rgba(0,0,0,0.5)"
                            name="height"
                        />
                    </Form>
                </View>
                <ActivityIndicator
                    animating={this.state.isLoading}
                    size="large"
                    color="#FF1D70"
                />
            </View>
        );
    },
});

export default LesionsScreen;
