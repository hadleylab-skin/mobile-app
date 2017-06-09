import React from 'react';
import _ from 'lodash';
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
        label: React.PropTypes.string.isRequired,
        styles: React.PropTypes.number.isRequired,
        source: React.PropTypes.number.isRequired,
        largeImageSource: React.PropTypes.number.isRequired,
        onAddingComplete: React.PropTypes.func.isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        patientsMoles: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    onPress() {
        const anatomicalSite = this.props.label;

        this.context.mainNavigator.push({
            component: ZoomedSite,
            title: 'Add photo',
            onLeftButtonPress: () => this.context.mainNavigator.pop(),
            onRightButtonPress: () => {
                this.context.mainNavigator.pop();
            },
            navigationBarHidden: false,
            rightButtonTitle: 'Cancel',
            leftButtonIcon: require('components/icons/back/back.png'),
            tintColor: '#FF2D55',
            passProps: {
                tree: this.props.tree.select(anatomicalSite),
                source: this.props.largeImageSource,
                label: this.props.label,
                onAddingComplete: this.props.onAddingComplete,
            },
        });
    },

    render() {
        const { label, styles, source } = this.props;

        return (
            <TouchableWithoutFeedback onPress={this.onPress}>
                <View style={[s.siteWrapper, styles, { opacity: 0 }]}>
                    <Image source={source} />
                </View>
            </TouchableWithoutFeedback>
        );
    },
}));

export default TouchableArea;
