import _ from 'lodash';
import React from 'react';
import {
    View,
    Alert,
} from 'react-native';
import schema from 'libs/state';
import { InfoField, Button } from 'components';
import { getConsentDocsScreenRoute } from './consent-docs';

import ss from './styles';

const model = {
    invites: {},
    declineInviteCursor: {}
};

export const InviteDetailScreen = schema(model)(React.createClass({
    propTypes: {
        invite: React.PropTypes.object.isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        services: React.PropTypes.shape({
            declineInviteService: React.PropTypes.func.isRequired,
        }),
    },

    async declineInvite() {
        const { invite } = this.props;

        const result = await this.context.services.declineInviteService(
            invite.pk,
            this.props.tree.declineInviteCursor);
        if (result.status === 'Succeed') {
            const invites = _.filter(
                this.props.tree.invites.data.get(),
                (item) => item.pk !== invite.pk);

            this.props.tree.invites.data.set(invites);
            this.context.mainNavigator.popToTop();
        } else {
            Alert.alert('Error', JSON.stringify(result.error.data));
        }
    },

    render() {
        const { invite } = this.props;
        const doctor = invite.doctor;

        return (
            <View style={ss.container}>
                <InfoField
                    title={'Doctor'}
                    text={`${doctor.firstName} ${doctor.lastName}`}
                />
                <InfoField
                    title={'Study'}
                    text={invite.study.title}
                />
                <View style={ss.buttons}>
                    <Button
                        type="green"
                        title="Approve"
                        style={ss.button}
                        onPress={() =>
                            this.context.mainNavigator.push(
                                getConsentDocsScreenRoute({
                                    invite: invite,
                                    tree: this.props.tree,
                                }, this.context)
                            )
                        }
                    />
                    <Button
                        type="rect"
                        title="Decline"
                        style={ss.button}
                        onPress={() => {
                            Alert.alert(
                                'Are you sure?',
                                'Are you sure you want to decline the invitation?',
                                [
                                    {text: 'Cancel'},
                                    {text: 'Yes', onPress: this.declineInvite}
                                ]
                            )
                        }}
                    />
                </View>
            </View>
        );
    },
}));

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
