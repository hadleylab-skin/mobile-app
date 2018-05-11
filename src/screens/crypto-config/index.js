import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    ScrollView,
    Switch,
    Alert,
    Linking,
} from 'react-native';
import schema from 'libs/state';
import { resetState } from 'libs/tree';
import { Button } from 'components';
import { getKeyPairStatus, createNewKeyPair,
         getKeyPair, encryptAES, isInSharedMode,
} from 'services/keypair';
import s from './styles';


const model = {
    tree: {
        localKeyPairData: {},
        localKeyPairStatus: {},
    },
};


export const CryptoConfiguration = schema(model)(React.createClass({
    propTypes: {
        doctorCursor: BaobabPropTypes.cursor.isRequired,
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired,
    },
    contextTypes: {
        services: React.PropTypes.shape({
            updateDoctorService: React.PropTypes.func.isRequired,
        }),
    },

    componentWillMount() {
        this.props.tree.localKeyPairStatus.on('update', this.syncKeyStatus);
    },

    componentWillUnmount() {
        this.props.tree.localKeyPairStatus.off('update', this.syncKeyStatus);
    },

    syncKeyStatus() {
        const result = this.props.tree.localKeyPairStatus.get();
        if (result.status === 'Succeed') {
            this.props.keyPairStatusCursor.set(result);
        }
    },

    async regenerateRSAKeypair() {
        let result = await createNewKeyPair(this.props.tree.localKeyPairData);
        if (result.status === 'Exists') {
            result = await this.context.services.updateDoctorService(
                this.props.doctorCursor, {
                    publicKey: result.publicKey,
                });
        }
        if (result.status === 'Failure') {
            Alert.alert('Error', JSON.stringify(result.error));
        }
        const password = this.props.doctorCursor.tree.get('loginScreen', 'form', 'password');
        await getKeyPairStatus(
            this.props.tree.localKeyPairStatus,
            this.props.doctorCursor.data.get(),
            password);
    },

    async exportSettingsChange(value) {
        const password = this.props.doctorCursor.tree.get('loginScreen', 'form', 'password');
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
            this.props.tree.localKeyPairStatus,
            this.props.doctorCursor.data.get(),
            password);
    },

    async makeResetKeys() {
        const result = this.regenerateRSAKeypair();

        const { publicKey } = result.data;
        await this.context.services.updateDoctorService(
            this.props.doctorCursor, {
                publicKey,
            });
    },

    resetKeys() {
        Alert.alert(
            'Are you sure?',
            'If you will reset keys, you will lost encrypted patients names and ages',
            [
                { text: 'Cancel' },
                { text: 'Yes', onPress: this.makeResetKeys },
            ]
        );
    },

    renderCryptographyInfo() {
        const status = this.props.keyPairStatusCursor.status.get();
        const doctor = this.props.doctorCursor.data.get();
        if (status === 'Failure') {
            if (isInSharedMode()) {
                return (
                    <View style={s.container}>
                        <Text style={s.group}>
                            The app is running is the shared mode.
                            In this mode your private key is loaging from the server.
                            However you don't export your private key yet.
                        </Text>
                        <Button
                            title="How to export private key"
                            onPress={() => Linking.openURL('https://skin.hadleylab.com/web_ui/#/how-to-share-private-key')}
                        />
                        <Button
                            title="Log out"
                            onPress={resetState}
                        />

                    </View>
                );
            }

            let { data } = this.props.keyPairStatusCursor.get();
            data = data || {};
            if (!data.publicKey && !data.privateKey && !doctor.publicKey) {
                return (
                    <View style={s.container}>
                        <Text style={s.group}>
                            Since this is your first time using the app,
                            we must generate a RSA security key tied to an Apple account.
                            By default the key will be stored in your iCloud keychain
                            to provide access from all your devices.
                        </Text>
                        <Button
                            title="Generate key-pair"
                            onPress={this.regenerateRSAKeypair}
                        />
                    </View>
                );
            }
            return (
                <View style={s.container}>
                    <Text style={[s.title, s.group]}>Key pair Error</Text>
                    <Text style={s.group}>
                        Public key from your device
                        doesn't much public key
                        you have created
                        when you login first time.
                    </Text>
                    <Text style={s.group}>
                        Probably you are using one device for multiple accounts,
                        the app doesn't support it yet.
                    </Text>
                    <View
                        style={s.group}
                    >
                        <Button
                            title="Log out"
                            onPress={resetState}
                        />
                    </View>

                    <Button
                        title="Reset keys"
                        onPress={this.resetKeys}
                    />
                </View>
            );
        }
        return this.renderExport();
    },

    renderExport() {
        const exported = this.props.keyPairStatusCursor.keyPairStatus.get('exported');
        return (
            <View style={s.container}>
                <Text>Key is {exported ? '' : 'not'} exported for the web app</Text>
                <Switch
                    onValueChange={this.exportSettingsChange}
                    value={exported}
                />
            </View>

        );
    },

    render() {
        return (
            <ScrollView style={{ margin: 50 }}>
                <Text style={s.mainTitle}>
                    Cryptography Configuration
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

