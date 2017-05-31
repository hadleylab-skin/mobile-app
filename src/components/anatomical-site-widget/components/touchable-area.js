import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    TouchableWithoutFeedback,
    Image,
} from 'react-native';
import schema from 'libs/state';
import ZoomedSite from './zoomed-site';
import s from '../styles';

const TouchableArea = schema({})(React.createClass({
    displayName: 'TouchableArea',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
        label: React.PropTypes.string.isRequired,
        styles: React.PropTypes.number.isRequired,
        source: React.PropTypes.number.isRequired,
        largeImageSource: React.PropTypes.number.isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    onPress() {
        // const { cursor, label } = this.props;
        // cursor.set(label);

        this.context.mainNavigator.push({
            component: ZoomedSite,
            title: 'Add photo',
            onLeftButtonPress: () => this.context.mainNavigator.pop(),
            onRightButtonPress: () => {
                this.context.mainNavigator.pop();
            },
            navigationBarHidden: false,
            rightButtonTitle: 'Cancel',
            tintColor: '#FF2D55',
            passProps: {
                source: this.props.largeImageSource,
            },
        });
    },

    render() {
        const { cursor, label, styles, source } = this.props;

        return (
            <TouchableWithoutFeedback onPress={this.onPress}>
                <View style={[s.siteWrapper, styles, { opacity: cursor.get() === label ? 1 : 0 }]}>
                    <Image source={source} />
                </View>
            </TouchableWithoutFeedback>
        );
    },
}));

export default TouchableArea;
