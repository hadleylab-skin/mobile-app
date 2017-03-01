import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    TouchableWithoutFeedback,
    Image,
} from 'react-native';
import s from './styles';

import front from './images/front.png';
import head from './images/head/head.png';
import neck from './images/neck/neck.png';
import rightShoulder from './images/right-shoulder/right-shoulder.png';
import rightChest from './images/right-chest/right-chest.png';

const TouchableArea = React.createClass({
    displayName: 'AnatomicalSiteWidget',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
        label: React.PropTypes.string.isRequired,
        className: React.PropTypes.string.isRequired,
        source: React.PropTypes.number.isRequired,
    },

    onPress() {
        const { cursor, label } = this.props;
        cursor.set(label);
    },

    render() {
        const { cursor, label, className, source } = this.props;

        return (
            <TouchableWithoutFeedback onPress={this.onPress}>
                <View style={[s[className], s.siteWrapper, { opacity: cursor.get() === label ? 1 : 0 }]}>
                    <Image source={source} />
                </View>
            </TouchableWithoutFeedback>
        );
    },
});

export const AnatomicalSiteWidget = React.createClass({
    displayName: 'AnatomicalSiteWidget',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
    },

    render() {
        const { cursor } = this.props;

        return (
            <View style={s.container}>
                <Text>Site: {cursor.get()}</Text>
                <View style={s.widget}>
                    <Image source={front} style={{ opacity: 0.5 }} />
                    <TouchableArea cursor={cursor} label="Head" className="head" source={head} />
                    <TouchableArea cursor={cursor} label="Right Shoulder" className="rightShoulder" source={rightShoulder} />
                    <TouchableArea cursor={cursor} label="Right Chest" className="rightChest" source={rightChest} />
                    <TouchableArea cursor={cursor} label="Neck" className="neck" source={neck} />
                </View>
            </View>
        );
    },
});
