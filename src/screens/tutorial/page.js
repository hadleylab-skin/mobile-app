import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    Text,
    Image,
} from 'react-native';

import s from './styles';


export const TutorialPage = createReactClass({
    displayName: 'TutorialPage',

    propTypes: {
        // image: PropTypes,
        header: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
    },

    render() {
        const { header, text, image } = this.props;

        return (
            <View style={s.pageContainer}>
                <Image
                    source={image}
                    style={s.image}
                />

                <Text style={s.header}>
                    {header}
                </Text>

                <Text style={s.text}>
                    {text}
                </Text>
            </View>
        );
    },
});
