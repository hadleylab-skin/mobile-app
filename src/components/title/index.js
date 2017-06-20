import React from 'react';
import _ from 'lodash';
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
            <View style={s.title}>
                <Text style={s.text}>
                    {_.upperCase(text)}
                </Text>
            </View>
        );
    },
});
