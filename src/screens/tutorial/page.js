import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    Text,
    Dimensions,
} from 'react-native';
import SvgUri from 'react-native-svg-uri';

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
        const windowWidth = Dimensions.get('window').width;

        return (
            <View style={s.pageContainer}>
                <SvgUri
                    width={windowWidth - 50}
                    height={windowWidth - 50}
                    source={image}
                />
                <Image style={s.image} source={image} />

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
