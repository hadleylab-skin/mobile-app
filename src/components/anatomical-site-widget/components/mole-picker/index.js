import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    TouchableWithoutFeedback,
    Image,
    View,
} from 'react-native';
import schema from 'libs/state';
import s from './styles';

import dotImage from './images/dot.png';

const MolePicker = schema({})(React.createClass({
    displayName: 'MolePicker',

    propTypes: {
        onMolePick: React.PropTypes.func.isRequired,
        children: React.PropTypes.node.isRequired,
    },

    getInitialState() {
        return {
            locationX: null,
            locationY: null,
        };
    },

    onPress(event) {
        const { locationX, locationY } = event.nativeEvent;

        this.setState({ locationX, locationY });
        this.props.onMolePick(locationX, locationY);
    },

    render() {
        const { locationX, locationY } = this.state;

        return (
            <TouchableWithoutFeedback onPress={(event) => this.onPress(event)}>
                <View style={s.container}>
                    {this.props.children}
                    {locationX && locationY ?
                        <Image source={dotImage} style={[s.dot, { left: locationX, top: locationY }]} />
                    : null}
                </View>
            </TouchableWithoutFeedback>
        );
    },
}));

export default MolePicker;
