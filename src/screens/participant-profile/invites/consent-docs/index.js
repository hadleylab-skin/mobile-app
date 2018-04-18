import _ from 'lodash';
import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Alert,
    ScrollView,
    NativeEventEmitter,
    NativeModules,
    ProgressViewIOS
} from 'react-native';
import OpenFile from 'react-native-doc-viewer';
import schema from 'libs/state';
import { encryptRSA, decryptRSA } from 'services/keypair';
import { InfoField, Button } from 'components';
import { getSignatureRoute } from 'screens/signature';
import s from '../styles';
import ss from './styles';

const eventEmitter = new NativeEventEmitter(NativeModules.RNReactNativeDocViewer);

const model = {
    tree: {
        consentCursor: {},
        approveInviteCursor: {},
        studies: {},
        invites: {},
        selectedStudyPk: null,
    },
};

export const ConsentDocsScreen = schema(model)(React.createClass({
    propTypes: {
        invite: React.PropTypes.object.isRequired, // eslint-disable-line
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        cursors: React.PropTypes.shape({
            patients: BaobabPropTypes.cursor.isRequired,
        }),
        services: React.PropTypes.shape({
            updatePatientConsentService: React.PropTypes.func.isRequired,
            approveInviteService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        return {
            progress: 0,
        };
    },

    componentDidMount() {
        eventEmitter.addListener(
            'RNDownloaderProgress',
            (Event) => {
                const progress = Event.progress / 100.0;
                this.setState({ progress });
            }
        );
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
            if (this.props.tree.studies.data.get().length === 0) {
                this.props.tree.selectedStudyPk.set(invite.study.pk);
            }

            const invites = _.filter(
                this.props.tree.invites.data.get(),
                (item) => item.pk !== invite.pk);

            this.props.tree.invites.data.set(invites);
            this.props.tree.studies.data.push(invite.study);
            this.context.mainNavigator.popToTop();
        } else {
            Alert.alert('Error', JSON.stringify(result.error.data));
        }
    },

    render() {
        const { invite } = this.props;
        const study = invite.study;
        const { progress } = this.state;
        const patients = this.context.cursors.patients.get();
        const patient = _.first(_.values(patients.data)).data;

        if (progress > 0 && progress < 1) {
            return (
                <View style={s.container}>
                    <ProgressViewIOS progress={progress} />
                </View>
            );
        }

        return (
            <View style={s.container}>
                <ScrollView>
                    <Text style={ss.text}>
                        Please, read this documents {'\n'} and confirm with sign
                    </Text>
                    {_.map(study.consentDocs, (consentDoc, index) => (
                        <InfoField
                            key={consentDoc.pk}
                            title={consentDoc.originalFilename || `Consent doc #${index}`}
                            text={'>'}
                            onPress={() => {
                                OpenFile.openDoc([{
                                    url: consentDoc.file,
                                    fileNameOptional: consentDoc.originalFilename || `Consent doc #${index}`,
                                }], () => {});
                            }}
                        />
                    ))}
                </ScrollView>
                <View style={s.buttons}>
                    <Button
                        type="green"
                        title="Accept"
                        style={s.button}
                        onPress={() => {
                            this.context.mainNavigator.push(
                                getSignatureRoute({
                                    navigator: this.props.navigator,
                                    onSave: async (signatureData) => {
                                        await this.context.services.updatePatientConsentService(
                                            patient.pk,
                                            this.props.tree.consentCursor,
                                            signatureData.encoded,
                                        );
                                        const consent = this.props.tree.consentCursor.get();
                                        this.approveInvite(patient, consent.data.pk);
                                    },
                                })
                            );
                        }}
                    />
                </View>
            </View>
        );
    },
}));

export function getConsentDocsScreenRoute(props, context) {
    return {
        component: ConsentDocsScreen,
        title: 'Consent docs',
        onLeftButtonPress: () => context.mainNavigator.pop(),
        navigationBarHidden: false,
        leftButtonIcon: require('components/icons/back/back.png'),
        tintColor: '#FF1D70',
        passProps: props,
    };
}
