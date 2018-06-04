import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    ScrollView,
} from 'react-native';
import schema from 'libs/state';
import { InfoField } from 'components';
import { getInviteDetailScreenRoute } from './detail';

import s from '../styles';


export const InvitesScreen = schema({})(createReactClass({
    propTypes: {
        invites: PropTypes.arrayOf(PropTypes.object).isRequired,
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired, // eslint-disable-line
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
                                        invite,
                                        tree: this.props.tree,
                                    }, this.context)
                                )
                            }
                        />
                    ))}
                </ScrollView>
            </View>
        );
    },
}));

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
