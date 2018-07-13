import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    Alert,
} from 'react-native';
import schema from 'libs/state';
import { encryptRSA, decryptRSA } from 'services/keypair';
import { InfoField, Button } from 'components';
import { getSignatureRoute } from 'screens/signature';
import { getAgreementRoute } from 'screens/create-or-edit/screens/agreement';
import { getConsentDocsScreenRoute } from 'screens/consent-docs';

import ss from './styles';

const model = {
    invites: {},
    declineInviteCursor: {},
    consentCursor: {},
};

export const InviteDetailScreen = schema(model)(createReactClass({
    propTypes: {
        invite: PropTypes.object.isRequired, // eslint-disable-line
        studiesCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired, // eslint-disable-line
        cursors: PropTypes.shape({
            currentStudyPk: BaobabPropTypes.cursor.isRequired,
        }),
        services: PropTypes.shape({
            declineInviteService: PropTypes.func.isRequired,
        }),
    },

    async onSign(signatureData) {
        const patients = this.context.cursors.patients.get();
        const patient = _.first(_.values(patients.data)).data;

        await this.context.services.updatePatientConsentService(
            patient.pk,
            this.props.tree.consentCursor,
            signatureData.encoded,
        );
        const consent = this.props.tree.consentCursor.get();
        this.approveInvite(patient, consent.data.pk);
    },

    async approveInvite(patient, consentPk) {
        // 1. restore original AES key of patient
        const aesKey = await decryptRSA(patient.encryptedKey);
        // 2. encrypt it with public key of invite's doctor and don't forget about coordinator
        const { invite } = this.props;
        const inviteDoctor = invite.doctor;
        const data = {
            consentPk,
            doctorEncryptionKey: await encryptRSA(aesKey, inviteDoctor.publicKey),
            ...inviteDoctor.coordinatorPublicKey && {
                coordinatorEncryptionKey: await encryptRSA(aesKey, inviteDoctor.coordinatorPublicKey),
            },
        };
        // 3. send it to server
        const result = await this.context.services.approveInviteService(
            invite.pk,
            this.props.tree.approveInviteCursor,
            data);
        if (result.status === 'Succeed') {
            if (_.isEmpty(this.props.studiesCursor.get('data'))) {
                this.context.cursors.currentStudyPk.set('data', invite.study.pk);
            }

            const invites = _.filter(
                this.props.tree.invites.data.get(),
                (item) => item.pk !== invite.pk);

            this.props.tree.invites.data.set(invites);
            this.props.studiesCursor.data.push(invite.study);
            this.context.mainNavigator.popToTop();
        } else {
            Alert.alert('Error', JSON.stringify(result.error.data));
        }
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
                        onPress={() => {
                            if (_.isEmpty(invite.study.consentDocs)) {
                                this.context.mainNavigator.push(
                                    getAgreementRoute({
                                        navigator: this.context.mainNavigator,
                                        onAgree: () => this.context.mainNavigator.push(
                                            getSignatureRoute({
                                                navigator: this.context.mainNavigator,
                                                onSave: this.onSign,
                                            })),
                                    })
                                );
                            } else {
                                this.context.mainNavigator.push(
                                    getConsentDocsScreenRoute({
                                        study: invite.study,
                                        tree: this.props.tree,
                                        onSign: this.onSign,
                                    }, this.context)
                                );
                            }
                        }}
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
                                    { text: 'Cancel' },
                                    { text: 'Yes', onPress: this.declineInvite },
                                ]
                            );
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
