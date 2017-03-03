import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Image,
} from 'react-native';
import TouchableArea from '../touchable-area';
import s from './styles';

import back from './images/back/back.png';

const HumanBackSide = React.createClass({
    displayName: 'HumanBackSide',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
    },

    render() {
        const { cursor, isShown } = this.props;

        return (
            <View style={[s.container, { opacity: isShown ? 1 : 0, zIndex: isShown ? 1 : 0 }]}>
                <Image source={back} style={{ opacity: 0.5 }} />
            </View>
        );
    },
});

export default HumanBackSide;
