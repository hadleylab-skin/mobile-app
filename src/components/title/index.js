import React from 'react';
import {
    View,
    Text,
} from 'react-native';
import s from './styles';

export const Title = React.createClass({

    propTypes: {
        text: React.PropTypes.string.isRequired,
    },

    render() {
        const { text } = this.props;

        return (
            <View style={s.wrapper}>
                <Text style={s.title}>{text}</Text>
            </View>
        );
    },
});
