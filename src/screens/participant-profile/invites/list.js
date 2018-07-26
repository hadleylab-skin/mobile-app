import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    ScrollView,
    SafeAreaView,
    StatusBar,
    View,
    TouchableOpacity,
    Text,
    Alert,
} from 'react-native';
import schema from 'libs/state';
import { getInviteDetailScreenRoute } from './detail';

import s from './styles';


export const InvitesScreen = schema({})(createReactClass({
    propTypes: {
        invites: PropTypes.arrayOf(PropTypes.object).isRequired,
        studiesCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired, // eslint-disable-line
    },

    render() {
        const { invites } = this.props;

        return (
            <SafeAreaView style={s.container}>
                <StatusBar barStyle="dark-content" />
                <ScrollView automaticallyAdjustContentInsets={false}>
                    {_.map(invites, (invite) => (
                        <TouchableOpacity
                            key={invite.pk}
                            activeOpacity={0.5}
                            onPress={() => this.context.mainNavigator.push(
                                getInviteDetailScreenRoute({
                                    invite,
                                    studiesCursor: this.props.studiesCursor,
                                    tree: this.props.tree,
                                },
                                this.context)
                            )}
                        >
                            <View style={s.invite}>
                                <View style={s.border} />
                                <View style={s.inner}>
                                    <Text style={s.name}>
                                        {`doctor: ${invite.doctor.firstName} ${invite.doctor.lastName}`}
                                    </Text>
                                    <Text style={s.text}>
                                        {`study: ${invite.study.title}`}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </SafeAreaView>
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
