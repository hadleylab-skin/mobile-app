import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import _ from 'lodash';
import {
    View,
    Text,
} from 'react-native';
import s from './styles';

export const Title = createReactClass({

    propTypes: {
        text: PropTypes.string.isRequired,
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
