import _ from 'lodash';
import React from 'react';
import {
    View,
    Text,
    ScrollView
} from 'react-native';
import schema from 'libs/state';
import { InfoField, Button } from 'components';
import { getConsentDocsScreenRoute } from './consent-docs';

import ss from './styles';


const model = {
    consentDocsScreen: {},
};


export const InviteDetailScreen = schema(model)(React.createClass({
    propTypes: {
        invite: React.PropTypes.object.isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
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
                                    study: invite.study,
                                    tree: this.props.tree.consentDocsScreen,
                                }, this.context)
                            )
                        }
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
