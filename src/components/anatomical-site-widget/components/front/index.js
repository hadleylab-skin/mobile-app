import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Image,
} from 'react-native';
import * as images from './static';
import TouchableArea from '../touchable-area';
import s from './styles';

import front from './images/front/front.png';

const sites = _.map(_.toPairs(images), (image) => {
    const key = image[0];
    const label = _.startCase(key);
    const styles = s[key];
    const source = image[1];

    return {
        label,
        styles,
        source,
    };
});

const HumanFrontSide = React.createClass({
    displayName: 'HumanFrontSide',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
    },

    render() {
        const { cursor, isShown } = this.props;

        return (
            <View style={{ opacity: isShown ? 1 : 0, zIndex: isShown ? 1 : 0 }}>
                <Image source={front} style={{ opacity: 0.5 }} />
                {_.map(sites, (site, index) =>
                    <TouchableArea
                        key={index}
                        cursor={cursor}
                        label={site.label}
                        styles={site.styles}
                        source={site.source}
                    />
                )}
            </View>
        );
    },
});

export default HumanFrontSide;
