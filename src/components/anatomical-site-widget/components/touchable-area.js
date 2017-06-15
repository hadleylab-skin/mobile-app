import React from 'react';
import _ from 'lodash';
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
        anatomicalSite: React.PropTypes.string.isRequired,
        styles: React.PropTypes.number.isRequired,
        source: React.PropTypes.number.isRequired,
        largeImageSource: React.PropTypes.number.isRequired,
        onAddingComplete: React.PropTypes.func.isRequired,
        anatomicalSitesWithMoles: React.PropTypes.arrayOf(React.PropTypes.string),
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    getInitialState() {
        return {
            isActive: false,
        };
    },

    onCancelAddingMole() {
        const anatomicalSite = this.props.anatomicalSite;

        this.setState({ isActive: false });
        this.props.tree.select('data', anatomicalSite, 'showMessage').set(false);
        this.context.mainNavigator.pop();
    },

    onPress() {
        const anatomicalSite = this.props.anatomicalSite;
        this.setState({ isActive: true });

        this.context.mainNavigator.push({
            component: ZoomedSite,
            title: 'Add photo',
            onLeftButtonPress: () => this.onCancelAddingMole(),
            onRightButtonPress: () => this.onCancelAddingMole(),
            navigationBarHidden: false,
            rightButtonTitle: 'Cancel',
            leftButtonIcon: require('components/icons/back/back.png'),
            tintColor: '#FF1D70',
            passProps: {
                tree: this.props.tree.select('data', anatomicalSite),
                source: this.props.largeImageSource,
                anatomicalSite: this.props.anatomicalSite,
                onAddingComplete: () => {
                    this.props.onAddingComplete();
                },
            },
        });
    },

    render() {
        const { isActive } = this.state;
        const { anatomicalSite, styles, source, anatomicalSitesWithMoles } = this.props;

        const hasMole = _.indexOf(anatomicalSitesWithMoles, anatomicalSite) !== -1;

        return (
            <TouchableWithoutFeedback onPress={this.onPress}>
                <View style={[s.siteWrapper, styles, { opacity: isActive || hasMole ? 1 : 0 }]}>
                    <Image source={source} />
                </View>
            </TouchableWithoutFeedback>
        );
    },
}));

export default TouchableArea;
