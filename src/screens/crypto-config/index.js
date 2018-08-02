import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    Text,
    ScrollView,
    Switch,
    Alert,
    Linking,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import schema from 'libs/state';
import { resetState } from 'libs/tree';
import { Button, InfoField } from 'components';
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


export const CryptoConfiguration = schema(model)(createReactClass({
    propTypes: {
        doctorCursor: BaobabPropTypes.cursor.isRequired,
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired,
    },
    contextTypes: {
        services: PropTypes.shape({
            updateDoctorService: PropTypes.func.isRequired,
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
        return await getKeyPairStatus(
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
        const result = await createNewKeyPair(this.props.tree.localKeyPairData);

        const { publicKey } = result;
        await this.context.services.updateDoctorService(
            this.props.doctorCursor, {
                publicKey,
                privateKey: '',
            });

        resetState();
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
                    <View>
                        <View style={s.content}>
                            <Text style={s.text}>
                                The app is running is the shared mode.
                                In this mode your private key is loaging from the server.
                                However you don't export your private key yet.
                            </Text>
                        </View>
                        <View style={s.button}>
                            <Button
                                title="How to export private key"
                                onPress={() => Linking.openURL('https://skin.hadleylab.com/web_ui/#/how-to-share-private-key')}
                            />
                        </View>
                        <View style={s.button}>
                            <Button title="Log out" onPress={resetState} />
                        </View>
                    </View>
                );
            }

            let { data } = this.props.keyPairStatusCursor.get();
            data = data || {};
            if (!data.publicKey && !data.privateKey && !doctor.publicKey) {
                return (
                    <View>
                        <View style={s.content}>
                            <Text style={s.text}>
                                Since this is your first time using the app,
                                we must generate a RSA security key tied to an Apple account.
                                By default the key will be stored in your iCloud keychain
                                to provide access from all your devices.
                            </Text>
                        </View>
                        <View style={s.button}>
                            <Button
                                title="Generate key-pair"
                                onPress={this.regenerateRSAKeypair}
                            />
                        </View>
                    </View>
                );
            }
            return (
                <View>
                    <View style={s.content}>
                        <Text style={[s.title]}>Key Pair Error</Text>
                        <Text style={s.text}>
                            The public key on your device
                            does not match the key created
                            during initial user registration.
                        </Text>
                        <Text style={s.text}>
                            This can occur if multiple accounts are being used on one device.
                            The app does not currently support this feature.
                        </Text>
                    </View>
                    <View style={s.button}>
                        <Button
                            title="Log out"
                            onPress={resetState}
                        />
                    </View>
                    <View style={s.button}>
                        <Button
                            title="Reset keys"
                            style={s.button}
                            onPress={this.resetKeys}
                        />
                    </View>
                </View>
            );
        }
        return this.renderExport();
    },

    renderExport() {
        const exported = this.props.keyPairStatusCursor.keyPairStatus.get('exported');

        return (
            <View style={s.fields}>
                <InfoField
                    title="Export key for the web app"
                    hasNoBorder
                    controls={
                        <Switch
                            onValueChange={this.exportSettingsChange}
                            value={exported}
                        />
                    }
                />
            </View>
        );
    },

    render() {
        return (
            <SafeAreaView style={s.container}>
                <ScrollView automaticallyAdjustContentInsets={false}>
                    <StatusBar barStyle="dark-content" />
                    <Text style={s.mainTitle}>
                        Cryptography Configuration
                    </Text>
                    {this.renderCryptographyInfo()}
                </ScrollView>
            </SafeAreaView>
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
