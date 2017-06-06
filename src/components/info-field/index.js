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
        hasNoBorder: React.PropTypes.bool,
    },

    onPress() {
        const { onPress } = this.props;

        if (onPress) {
            onPress();
        }
    },

    render() {
        const { title, text, hasNoBorder } = this.props;
        const hasBorder = !hasNoBorder;

        return (
            <TouchableWithoutFeedback onPress={() => this.onPress()}>
                <View style={s.container}>
                    <View style={s.leftColumn}>
                        <Text style={s.title}>{title}</Text>
                    </View>
                    <View style={s.rightColumn}>
                        {text && !this.props.children ? <Text style={s.text}>{text}</Text> : null}
                        {this.props.children && !text ? this.props.children : null}
                    </View>
                    {hasBorder ? <View style={s.border} /> : null}
                </View>
            </TouchableWithoutFeedback>
        );
    },
});
