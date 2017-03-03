import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Image,
} from 'react-native';
import TouchableArea from '../touchable-area';
import s from './styles';

const HumanBody = React.createClass({
    displayName: 'HumanBody',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
        bodyImage: React.PropTypes.number.isRequired,
        isShown: React.PropTypes.bool.isRequired,
        sites: React.PropTypes.arrayOf(React.PropTypes.shape({
            label: React.PropTypes.string.isRequired,
            styles: React.PropTypes.number.isRequired,
            source: React.PropTypes.number.isRequired,
        })),
    },

    render() {
        const { cursor, sites, bodyImage, isShown } = this.props;

        return (
            <View style={[s.container, { opacity: isShown ? 1 : 0, zIndex: isShown ? 1 : 0 }]}>
                <Image source={bodyImage} style={{ opacity: 0.5 }} />
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

export default HumanBody;
