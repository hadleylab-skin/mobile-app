import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import schema from 'libs/state';
import {
    View,
    TextInput,
} from 'react-native';
import s from './styles';

export const Input = schema({})(React.createClass({
    propTypes: {
        label: React.PropTypes.string.isRequired,
        cursor: BaobabPropTypes.cursor.isRequired,
        inputWrapperStyle: View.propTypes.style,
        inputStyle: TextInput.propTypes.style,
        placeholderTextColor: React.PropTypes.string,
    },

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
            this.setState({
                value: this.props.cursor.get(),
            });
        }
    },

    componentWillUnmount() {
        this.clearDeferredSyncTimer();
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

    render() {
        const { label, inputWrapperStyle, inputStyle,
                placeholderTextColor, ...props } = this.props;
        return (
            <View style={[s.container, inputWrapperStyle]}>
                <TextInput
                    style={[s.input, inputStyle]}
                    placeholder={label}
                    onChangeText={this.onChangeText}
                    onBlur={this.syncCursor}
                    placeholderTextColor={placeholderTextColor}
                    value={this.state.value}
                    {...props}
                />
            </View>
        );
    },
}));
