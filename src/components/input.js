import React from 'react';
import {
    View,
    StyleSheet,
    TextInput,
} from 'react-native';

export const Input = React.createClass({
    getInitialState() {
        return {
            value: this.props.cursor.get(),
        };
    },

    syncCursor() {
        this.props.cursor.set(this.state.value);
    },

    render() {
        const { label, cursor, ...props } = this.props;
        return (
            <View style={[styles.container, props.inputWrapperStyle || {}]}>
                <TextInput
                    style={[styles.input, props.inputStyle || {}]}
                    placeholder={label}
                    onChangeText={(text) => this.setState({ value: text })}
                    onBlur={this.syncCursor}
                    placeholderTextColor={props.placeholderTextColor || '#fff'}
                    value={this.state.value}
                    {...props}
                />
            </View>
        );
    },
});

const styles = StyleSheet.create({
    container: {
        borderBottomColor: '#fff',
        borderBottomWidth: 0.5,
        marginBottom: 35,
    },
    input: {
        height: 30,
        width: 250,
        color: '#fff',
    },
});

