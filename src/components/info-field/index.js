import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import s from './styles';

export const InfoField = React.createClass({

    propTypes: {
        title: React.PropTypes.oneOfType([
            React.PropTypes.string.isRequired,
            React.PropTypes.node.isRequired,
        ]),
        text: React.PropTypes.string,
        children: React.PropTypes.node,
        onPress: React.PropTypes.func,
        hasNoBorder: React.PropTypes.bool,
        controls: React.PropTypes.node,
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
            <TouchableOpacity
                onPress={() => this.onPress()}
                disabled={!this.props.onPress}
                activeOpacity={0.5}
            >
                <View>
                    <View style={s.container}>
                        <View style={s.leftColumn}>
                            <Text style={s.title}>{title}</Text>
                        </View>
                        <View style={s.rightColumn}>
                            {text && !this.props.controls ? <Text style={s.text}>{text}</Text> : null}
                            {this.props.controls && !text ? this.props.controls : null}
                        </View>
                        {hasBorder ? <View style={s.border} /> : null}
                    </View>
                    {this.props.children}
                </View>
            </TouchableOpacity>
        );
    },
});
