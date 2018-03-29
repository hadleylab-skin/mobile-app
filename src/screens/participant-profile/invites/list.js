import _ from 'lodash';
import React from 'react';
import {
    View,
    Text,
    ScrollView
} from 'react-native';
import { getInviteDetailScreenRoute } from './detail';
import { InfoField } from 'components';

import s from '../styles';


export const InvitesScreen = React.createClass({
    propTypes: {
        invites: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    render() {
        const { invites } = this.props;

        return (
            <View style={s.container}>
                <ScrollView style={s.inner}>
                    {_.map(invites, (invite) => (
                        <InfoField
                            key={invite.pk}
                            title={`doctor: ${invite.doctor.firstName} ${invite.doctor.lastName}
study: ${invite.study.title}`}
                            text={'>'}
                            onPress={() =>
                                this.context.mainNavigator.push(
                                    getInviteDetailScreenRoute({
                                        invite: invite,
                                    }, this.context)
                                )
                            }
                        />
                    ))}
                </ScrollView>
            </View>
        );
    },
});

export function getInvitesScreenRoute(props, context) {
    return {
        component: InvitesScreen,
        title: 'Invites list',
        onLeftButtonPress: () => context.mainNavigator.pop(),
        navigationBarHidden: false,
        leftButtonIcon: require('components/icons/back/back.png'),
        tintColor: '#FF1D70',
        passProps: props,
    };
}
