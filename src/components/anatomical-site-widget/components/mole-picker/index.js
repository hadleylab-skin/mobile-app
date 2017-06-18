import React from 'react';
import {
    TouchableWithoutFeedback,
    Image,
    View,
} from 'react-native';
import schema from 'libs/state';
import dotImage from 'components/icons/dot/dot.png';
import s from './styles';

const MolePicker = schema({})(React.createClass({
    displayName: 'MolePicker',

    propTypes: {
        onMolePick: React.PropTypes.func.isRequired,
        clearDot: React.PropTypes.bool,
        children: React.PropTypes.node.isRequired,
        disabled: React.PropTypes.bool,
    },

    getInitialState() {
        return {
            locationX: null,
            locationY: null,
        };
    },

    componentWillReceiveProps(nextProps) {
        if (this.props.clearDot !== nextProps.clearDot && nextProps.clearDot) {
            this.addDotlocation(null, null);
        }
    },

    onPress(event) {
        const { locationX, locationY } = event.nativeEvent;

        if (this.props.disabled) {
            return;
        }

        this.addDotlocation(locationX, locationY);
    },

    addDotlocation(locationX, locationY) {
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
