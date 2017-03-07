import React from 'react';
import {
    View,
    Text,
    TouchableWithoutFeedback,
} from 'react-native';
import s from './styles';

export const InfoField = React.createClass({

    propTypes: {
        title: React.PropTypes.string.isRequired,
        text: React.PropTypes.string,
        children: React.PropTypes.node,
        onPress: React.PropTypes.func,
    },

    onPress() {
        const { onPress } = this.props;

        if (onPress) {
            onPress();
        }
    },

    render() {
        const { title, text } = this.props;

        return (
            <TouchableWithoutFeedback onPress={() => this.onPress()}>
                <View style={s.wrapper}>
                    <Text style={s.title}>{title}:</Text>
                    {text ? (
                        <Text style={s.text}>{text}</Text>
                    ) : null}
                    {this.props.children}
                </View>
            </TouchableWithoutFeedback>
        );
    },
});
