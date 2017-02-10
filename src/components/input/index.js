import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import schema from 'libs/state';
import {
    View,
    TextInput,
} from 'react-native';
import s from './styles';
import { Form } from '../form';

export const Input = schema({})(React.createClass({
    propTypes: {
        label: React.PropTypes.string.isRequired,
        cursor: BaobabPropTypes.cursor.isRequired,
        inputWrapperStyle: View.propTypes.style,
        inputStyle: TextInput.propTypes.style,
        placeholderTextColor: React.PropTypes.string,
        returnKeyType: React.PropTypes.string,
        onFocus: React.PropTypes.func,
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
        };
    },

    componentDidUpdate(prevProps, prevState) {
        if (this.deferredSyncTimer) {
            // Does not set state when component received props while user inputs
            return;
        }

        if (this.props.cursor.get() !== prevState.value) {
            this.setState({ // eslint-disable-line
                value: this.props.cursor.get(),
            });
        }
    },

    componentWillUnmount() {
        this.nextInputIndex = undefined;
        this.clearDeferredSyncTimer();
    },

    register(ref) {
        if (typeof this.nextInputIndex === 'undefined' && this.context.register) {
            this.nextInputIndex = this.context.register(ref);
        }
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
        this.setState({ value: text });
        this.deferredSyncValue();
    },

    onFocus() {
        if (this.props.onFocus) {
            this.props.onFocus();
        }
    },

    render() {
        const { label, inputWrapperStyle, inputStyle,
                placeholderTextColor, ...props } = this.props;

        return (
            <View style={[s.container, inputWrapperStyle]}>
                <TextInput
                    ref={this.register}
                    style={[s.input, inputStyle]}
                    placeholder={label}
                    onChangeText={this.onChangeText}
                    onBlur={this.syncCursor}
                    onFocus={this.onFocus}
                    placeholderTextColor={placeholderTextColor}
                    value={this.state.value}
                    onSubmitEditing={this.onSubmitEditing}
                    {...props}
                />
            </View>
        );
    },
}));
