import React from 'react';
import {
    Image,
    View,
} from 'react-native';
import schema from 'libs/state';
import s from './styles';

const ZoomedSite = schema({})(React.createClass({
    displayName: 'ZoomedSite',

    propTypes: {
        source: React.PropTypes.number.isRequired,
    },

    render() {
        const { source } = this.props;

        return (
            <View style={s.container}>
                <Image source={source} />
            </View>
        );
    },
}));

export default ZoomedSite;
