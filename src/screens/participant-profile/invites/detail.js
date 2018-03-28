import _ from 'lodash';
import React from 'react';
import {
    View,
    Text,
    ScrollView
} from 'react-native';
import { InfoField, Button } from 'components';

import s from '../styles';
import ss from './styles';


export const InviteDetailScreen = React.createClass({
    propTypes: {
        invite: React.PropTypes.object.isRequired,
    },

    render() {
        const { invite } = this.props;

        return (
            <View style={s.container}>
                <View style={ss.buttons}>
                    <Button
                        type="green"
                        title="Approve"
                        style={ss.button}
                        onPress={() => {}}
                    />
                    <Button
                        type="rect"
                        title="Decline"
                        style={ss.button}
                        onPress={() => {}}
                    />
                </View>
            </View>
        );
    },
});

export function getInviteDetailScreenRoute(props, context) {
    return {
        component: InviteDetailScreen,
        title: 'Invite',
        onLeftButtonPress: () => context.mainNavigator.pop(),
        navigationBarHidden: false,
        leftButtonIcon: require('components/icons/back/back.png'),
        tintColor: '#FF1D70',
        passProps: props,
    };
}
