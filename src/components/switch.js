import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import { Switch as RNSwitch } from 'react-native';

export const Switch = React.createClass({
    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
    },

    getInitialState() {
        return {
            value: this.props.cursor.get(),
        };
    },

    componentDidUpdate(prevProps, prevState) {
        if (this.props.cursor.get() !== prevState.value) {
            this.setState({ // eslint-disable-line
                value: this.props.cursor.get(),
            });
        }
    },

    onValueChange(value) {
        this.setState({ value });
        this.props.cursor.set(value);
    },

    render() {
        return (
            <RNSwitch
                onValueChange={this.onValueChange}
                value={this.state.value}
            />
        );
    },
});
