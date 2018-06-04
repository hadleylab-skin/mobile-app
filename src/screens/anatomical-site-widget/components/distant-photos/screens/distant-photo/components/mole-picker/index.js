import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {
    TouchableWithoutFeedback,
    Image,
    View,
} from 'react-native';
import schema from 'libs/state';
import dotImage from 'components/icons/dot-green/dot-green.png';
import s from './styles';

const MolePicker = schema({})(createReactClass({
    displayName: 'MolePicker',

    propTypes: {
        onMolePick: PropTypes.func.isRequired,
        children: PropTypes.node.isRequired,
        disabled: PropTypes.bool,
        style: PropTypes.object.isRequired, // eslint-disable-line
        positionX: PropTypes.number,
        positionY: PropTypes.number,
    },

    onPress(event) {
        const { locationX: positionX, locationY: positionY } = event.nativeEvent;

        if (this.props.disabled) {
            return;
        }

        this.addDotlocation(positionX, positionY);
    },

    addDotlocation(positionX, positionY) {
        this.props.onMolePick(positionX, positionY);
    },

    render() {
        const { positionX, positionY } = this.props;

        return (
            <TouchableWithoutFeedback onPress={(event) => this.onPress(event)}>
                <View style={[s.container, this.props.style]}>
                    {this.props.children}
                    {positionX && positionY ?
                        <Image source={dotImage} style={[s.dot, { left: positionX, top: positionY }]} />
                    : null}
                </View>
            </TouchableWithoutFeedback>
        );
    },
}));

export default MolePicker;
