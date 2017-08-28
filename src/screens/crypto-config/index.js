import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import _ from 'lodash';
import {
    View,
    Text,
    Image,
    ScrollView,
    Switch,
    Alert,
} from 'react-native';
import { InfoField, Title, Updater } from 'components';
import schema from 'libs/state';
import defaultUserImage from 'components/icons/empty-photo/empty-photo.png';
import { createNewKeyPair, getKeyPair, encryptAES, decryptAES } from 'services/keypair';
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
    getInitialState() {
        try {
            const password = this.props.doctorCursor.tree.get('login', 'password');

            const remotePrivateKey = decryptAES(this.props.doctorCursor.get('data', 'privateKey'), password);
            const remotePublicKey = this.props.doctorCursor.get('data', 'publicKey');

            const realPrivateKey = this.props.keyPairStatusCursor.get('privateKey');
            const realPublicKey = this.props.keyPairStatusCursor.get('publicKey');

            return {
                exported: remotePublicKey === realPublicKey
                    && remotePrivateKey === realPrivateKey,
            };
        } catch (error) {
            return {
                exported: false,
            };
        }
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
    },

    async exportSettingsChange(value) {
        this.setState({ exported: value });
        let keys = await getKeyPair();
        if (!value) {
            keys.privateKey = '';
        } else {
            const password = this.props.doctorCursor.tree.get('login', 'password');
            keys.privateKey = encryptAES(keys.privateKey, password);
        }
        const result = await this.context.services.updateDoctorService(this.props.doctorCursor, keys);
        if (result.status === 'Failure') {
            Alert.alert('Server side error', JSON.stringify(result.error));
            this.setState({ exported: !value });
        }
    },

    renderCryptographyInfo() {
        const status = this.props.keyPairStatusCursor.status.get();
        if (status === 'Loading') {
            return (
                <Text>
                    Loading
                </Text>
            );
        } if (status === 'Exists') {
            return (
                <View>
                    <Text>
                        RSA key is up to date
                    </Text>
                </View>
            );
        } else if (status === 'Failure') {
            const error = this.props.keyPairStatusCursor.error.get();
            return (
                <View>
                    <Text>Error</Text>
                    <Text>{JSON.stringify(error)}</Text>
                    <InfoField
                        title={'Regenerate RSA keypair'}
                        hasNoBorder
                        onPress={this.regenerateRSAKeypair}
                    />
                </View>
            );
        }
        return (
            <InfoField
                title={'Generate RSA keypair'}
                hasNoBorder
                onPress={this.regenerateRSAKeypair}
            />
        );
    },

    render() {
        const status = this.props.keyPairStatusCursor.status.get();
        return (
            <ScrollView>
                <Text>Cryptography configuaration</Text>
                {this.renderCryptographyInfo()}
                {
                    status === 'Exists'
                    ?
                    (
                        <View>
                            <Text>Key is exported for the web app</Text>
                            <Switch
                                onValueChange={this.exportSettingsChange}
                                value={this.state.exported}
                            />
                        </View>
                    )
                    :
                    null
                }
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

