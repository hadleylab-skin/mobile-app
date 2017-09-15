import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    ScrollView,
    Switch,
    Alert,
} from 'react-native';
import schema from 'libs/state';
import { Button } from 'components';
import { getKeyPairStatus } from 'services/keypair';
import { createNewKeyPair, getKeyPair, encryptAES } from 'services/keypair';
import s from './styles';

export const CryptoConfiguration = schema({})(React.createClass({
    propTypes: {
        doctorCursor: BaobabPropTypes.cursor.isRequired,
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired,
    },
    contextTypes: {
        services: React.PropTypes.shape({
            updateDoctorService: React.PropTypes.func.isRequired,
        }),
    },

    async regenerateRSAKeypair() {
        let result = await createNewKeyPair(this.props.keyPairStatusCursor);
        if (result.status === 'Exists') {
            result = await this.context.services.updateDoctorService(
                this.props.doctorCursor, {
                    publicKey: result.publicKey,
                });
        }
        if (result.status === 'Failure') {
            Alert.alert('Error', JSON.stringify(result.error));
        }
        const password = this.props.doctorCursor.tree.get('login', 'password');
        await getKeyPairStatus(
            this.props.keyPairStatusCursor,
            this.props.doctorCursor.data.get(),
            password);
    },

    async exportSettingsChange(value) {
        const password = this.props.doctorCursor.tree.get('login', 'password');
        let keys = await getKeyPair();
        if (!value) {
            keys.privateKey = '';
        } else {
            keys.privateKey = encryptAES(keys.privateKey, password);
        }
        const result = await this.context.services.updateDoctorService(this.props.doctorCursor, keys);
        if (result.status === 'Failure') {
            Alert.alert('Server side error', JSON.stringify(result.error));
        }
        await getKeyPairStatus(
            this.props.keyPairStatusCursor,
            this.props.doctorCursor.data.get(),
            password);
    },

    renderCryptographyInfo() {
        const status = this.props.keyPairStatusCursor.status.get();
        const doctor = this.props.doctorCursor.data.get();
        if (status === 'Failure') {
            const { firstTime, keyPairStatus, data } = this.props.keyPairStatusCursor.get();
            if (firstTime && !data.publicKey && !data.privateKey && !doctor.publicKey) {
                return (
                    <View>
                        <Text style={{ paddingTop: 10, paddingBottom: 10 }}>
                            It's first time when you are using the app,
                            please genetate RSA keypair.
                            By default is stores on you iClound keychain
                            so you can access it from all your devices
                        </Text>
                        <Button
                            title="Generate key-pair"
                            onPress={this.regenerateRSAKeypair}
                        />
                    </View>
                );
            }
            return (
                <View style={{ paddingTop: 10 }}>
                    <Text style={{ fontSize: 20, paddingBottom: 10 }}>Key pair Error</Text>
                    <Text style={{ paddingBottom: 10 }}>
                        Public key from your device
                        doesn't much public key
                        you have created
                        when you login first time.
                    </Text>
                    <Text style={{ paddingBottom: 10 }}>
                        Probably you are using one device for multiple accounts,
                        the app doesn't support it yet.
                    </Text>
                    <Button
                        title="Log out"
                        onPress={() => this.props.keyPairStatusCursor.tree.set({})}
                    />
                </View>
            );
        }
        return this.renderExport();
    },

    renderExport() {
        const exported = this.props.keyPairStatusCursor.keyPairStatus.get('exported');
        return (
            <View style={{ paddingTop: 10 }}>
                <Text>Key is {exported ? '' : 'not'} exported for the web app</Text>
                <Switch
                    onValueChange={this.exportSettingsChange}
                    value={exported}
                />
            </View>

        );
    },

    render() {
        const status = this.props.keyPairStatusCursor.status.get();
        return (
            <ScrollView style={{ margin: 50 }}>
                <Text style={{ fontSize: 30, fontWeight: 'bold'}}>
                    Cryptography configuaration
                </Text>
                {this.renderCryptographyInfo()}
            </ScrollView>
        );
    },
}));

export function getCryptoConfigurationRoute(props) {
    return {
        component: CryptoConfiguration,
        title: 'Cryptography',
        navigationBarHidden: false,
        tintColor: '#FF2D55',
        passProps: props,
    };
}

