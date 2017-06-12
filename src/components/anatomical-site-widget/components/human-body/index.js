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
        bodyImage: React.PropTypes.number.isRequired,
        sites: React.PropTypes.arrayOf(React.PropTypes.shape({
            anatomicalSite: React.PropTypes.string.isRequired,
            styles: React.PropTypes.number.isRequired,
            source: React.PropTypes.number.isRequired,
        })),
    },

    render() {
        const { sites, bodyImage } = this.props;

        return (
            <View style={s.container}>
                <Image source={bodyImage} style={{ opacity: 0.5 }} />
                {_.map(sites, (site, index) =>
                    <TouchableArea
                        tree={this.props.tree}
                        key={index}
                        {...site}
                        {...this.props}
                    />
                )}
            </View>
        );
    },
});

export default HumanBody;
