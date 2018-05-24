import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import schema from 'libs/state';
import {
    View,
    Text,
    TextInput,
    Easing,
    Animated,
    TouchableWithoutFeedback,
} from 'react-native';
import s from './styles';
import { Form } from '../form';

export const Input = schema({})(createReactClass({
    propTypes: {
        label: PropTypes.string.isRequired,
        cursor: BaobabPropTypes.cursor.isRequired,
        inputWrapperStyle: View.propTypes.style,
        inputStyle: TextInput.propTypes.style,
        placeholderTextColor: PropTypes.string,
        returnKeyType: PropTypes.string,
        onFocus: PropTypes.func,
        name: PropTypes.string,
        errorWrapperStyle: View.propTypes.style,
        errorStyle: Text.propTypes.style,
        errorPlaceholderTextColor: PropTypes.string,
    },

    contextTypes: Form.childContextTypes,

    getDefaultProps() {
        return {
            inputWrapperStyle: {},
            inputStyle: {},
            placeholderTextColor: '#fff',
        };
    },

    getInitialState() {
        return {
            value: this.props.cursor.get(),
            errorMessage: '',
        };
    },

    componentWillMount() {
        this.animatedValue = new Animated.Value(0);
    },

    componentDidMount() {
        if (this.context.register) {
            this.nextInputIndex = this.context.register(this, this.props.name);
        }
    },

    componentDidUpdate(prevProps, prevState) {
        if (this.deferredSyncTimer) {
            // Does not set state when component received props while user inputs
            return;
        }

        if (this.props.cursor.get() !== prevState.value) {
            this.setState({ // eslint-disable-line
                value: this.props.cursor.get(),
                errorMessage: '',
            });
        }
    },

    componentWillUnmount() {
        this.clearDeferredSyncTimer();
    },

    onSubmitEditing() {
        this.syncCursor();
        const { returnKeyType } = this.props;
        if (this.context.next && returnKeyType === 'next') {
            this.context.next(this.nextInputIndex);
        }

        if (this.context.submit && returnKeyType === 'done') {
            this.context.submit();
        }
    },

    deferredSyncTimer: null,
    msToPoll: 200,

    clearDeferredSyncTimer() {
        if (this.deferredSyncTimer) {
            clearTimeout(this.deferredSyncTimer);
            this.deferredSyncTimer = null;
        }
    },

    deferredSyncValue() {
        this.clearDeferredSyncTimer();
        this.deferredSyncTimer = setTimeout(() => {
            this.deferredSyncTimer = null;
            this.syncCursor();
        }, this.msToPoll);
    },

    syncCursor() {
        this.clearDeferredSyncTimer();
        this.props.cursor.set(this.state.value);
    },

    onChangeText(text) {
        this.setState({ value: text, errorMessage: '' });
        this.deferredSyncValue();
    },

    onFocus() {
        if (this.props.onFocus) {
            this.props.onFocus();
        }
    },

    showError(errorMessage) {
        this.animatedValue.setValue(0);
        this.setState({ errorMessage });

        Animated.timing(
            this.animatedValue,
            {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
            }
        ).start();
    },

    focus() {
        this.input.focus();
    },

    render() {
        const { label, inputWrapperStyle, inputStyle, errorPlaceholderTextColor,
                placeholderTextColor, errorStyle, errorWrapperStyle, ...props } = this.props;

        const movingMargin = this.animatedValue.interpolate({
            inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
            outputRange: [0, -5, 5, -5, 5, -5, 5, -5, 5, -5, 0],
        });

        return (
            <TouchableWithoutFeedback onPress={this.focus}>
                <View style={[s.container, inputWrapperStyle]}>
                    {this.state.errorMessage ? (
                        <View style={[s.errorWrapper, errorWrapperStyle || {}]}>
                            <Text style={[s.error, errorStyle || {}]}>{this.state.errorMessage}</Text>
                        </View>
                    ) : null}
                    <Animated.View
                        style={{ transform: [{ translateX: movingMargin }] }}
                    >
                        <TextInput
                            ref={(ref) => (this.input = ref)}
                            style={inputStyle}
                            placeholder={label}
                            onChangeText={this.onChangeText}
                            onBlur={this.syncCursor}
                            onFocus={this.onFocus}
                            placeholderTextColor={this.state.errorMessage ? errorPlaceholderTextColor : placeholderTextColor}
                            value={this.state.value}
                            onSubmitEditing={this.onSubmitEditing}
                            {...props}
                        />
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        );
    },
}));
