import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Image,
} from 'react-native';
import TouchableArea from '../touchable-area';

import back from './images/back/back.png';

const HumanBackSide = React.createClass({
    displayName: 'HumanBackSide',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
    },

    render() {
        const { cursor } = this.props;

        return (
            <View>
                <Image source={back} style={{ opacity: 0.5 }} />
            </View>
        );
    },
});

export default HumanBackSide;
