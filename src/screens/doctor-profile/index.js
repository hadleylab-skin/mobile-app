import React from 'react';
import _ from 'lodash';
import {
    View,
    Text,
    Image,
} from 'react-native';
import { InfoField, Switch, Title, Updater } from 'components';
import schema from 'libs/state';
import defaultUserImage from 'components/icons/empty-photo/empty-photo.png';
import { createNewKeyPair, getKeyPairStatus, encryptRSA, decryptRSA, encryptAES, decryptAES } from 'services/keypair';
import s from './styles';

const model = {
    tree: {
        keyPairStatus: getKeyPairStatus,
        rsa: {
            text: 'hello world',
            plain: true,
        },
        aes: {
            text: 'hello world',
            plain: true,
        },
    },
};

export const DoctorProfile = schema(model)(React.createClass({
    propTypes: {
        logout: React.PropTypes.func.isRequired,
    },

    contextTypes: {
        services: React.PropTypes.shape({
            updateDoctorService: React.PropTypes.func.isRequired,
            getDoctorService: React.PropTypes.func.isRequired,
        }),
    },

    async onUnitsOfLengthChange(unit) {
        const service = this.context.services.updateDoctorService;
        const unitsOfLengthCursor = this.props.tree.select('data', 'unitsOfLength');

        if (unit === unitsOfLengthCursor.get()) {
            return;
        }

        unitsOfLengthCursor.set(unit);
        await service(this.props.tree, { unitsOfLength: unit });
    },

    regenerateRSAKeypair() {
        createNewKeyPair(this.props.tree.keyPairStatus);
    },

    async updateTextRSA() {
        const cursor = this.props.tree.rsa;
        const fn = cursor.get('plain') ? encryptRSA : decryptRSA;
        const text = await fn(cursor.get('text'));
        cursor.text.set(text);
        cursor.plain.apply((state) => !state);
    },

    updateTextAES() {
        const cursor = this.props.tree.aes;
        const fn = cursor.get('plain') ? encryptAES : decryptAES;
        const text = fn(cursor.get('text'), 'secret key 123');
        cursor.text.set(text);
        cursor.plain.apply((state) => !state);
    },

    renderCryptographyInfo() {
        const status = this.props.tree.keyPairStatus.status.get();
        if (status === 'Loading') {
            return (
                <Text>
                    Loading
                </Text>
            );
        } if (status === 'Exists') {
            const text = this.props.tree.rsa.get('text');
            return (
                <View>
                    <Text>
                        RSA key is up to date
                    </Text>
                    <InfoField
                        title={text}
                        hasNoBorder
                        onPress={this.updateTextRSA}
                    />
                </View>
            );
        } else if (status === 'Failure') {
            const error = this.props.tree.keyPairStatus.error.get();
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
        const { firstName, lastName, photo, degree, department } = this.props.tree.get('data');

        return (
            <Updater
                service={async () => await this.context.services.getDoctorService(this.props.tree)}
                style={s.container}
                color="#ACB5BE"
            >
                <View style={s.info}>
                    <View style={s.pinkBg} />
                    <Image
                        style={s.photo}
                        source={!_.isEmpty(photo) ? { uri: photo.thumbnail } : defaultUserImage}
                    />
                    <View style={s.name}>
                        <Text style={s.text}>
                            {`${firstName} ${lastName}`}
                            {degree ? `, ${degree}` : null}
                        </Text>
                    </View>
                    {department ?
                        <View>
                            <Text style={s.department}>{department}</Text>
                        </View>
                    : null}
                </View>
                <Title text={'SETTINGS'} />
                <View style={s.content}>
                    <InfoField
                        title={'Units of length'}
                        hasNoBorder
                        controls={
                            <Switch
                                cursor={this.props.tree.select('data', 'unitsOfLength')}
                                disabled={this.props.tree.get('status') === 'Loading'}
                                items={[
                                    { label: 'in', value: 'in' },
                                    { label: 'cm', value: 'cm' },
                                ]}
                                itemWidth={70}
                                onPress={this.onUnitsOfLengthChange}
                            />
                        }
                    />
                </View>
                { this.renderCryptographyInfo() }
                <View>
                    <Text>
                        AES key
                    </Text>
                    <InfoField
                        title={this.props.tree.aes.text.get()}
                        hasNoBorder
                        onPress={this.updateTextAES}
                    />
                </View>
                {/* <View style={s.logout}>
                    <InfoField
                    title={'Log out'}
                    hasNoBorder
                    onPress={this.props.logout}
                    />
                    </View>
                  */}
            </Updater>
        );
    },
}));
