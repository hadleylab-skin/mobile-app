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
            label: React.PropTypes.string.isRequired,
            styles: React.PropTypes.number.isRequired,
            source: React.PropTypes.number.isRequired,
        })),
        onAddingComplete: React.PropTypes.func.isRequired,
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
                        label={site.label}
                        styles={site.styles}
                        source={site.source}
                        largeImageSource={site.largeImageSource}
                        onAddingComplete={this.props.onAddingComplete}
                    />
                )}
            </View>
        );
    },
});

export default HumanBody;
