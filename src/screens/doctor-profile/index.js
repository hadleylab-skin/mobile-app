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
import { createNewKeyPair, getKeyPairStatus } from 'services/keypair';
import s from './styles';

const model = {
    tree: {
        keyPairStatus: getKeyPairStatus,
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

    renderCryptographyInfo() {
        const status = this.props.tree.keyPairStatus.status.get();
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
                <View style={s.logout}>
                    <InfoField
                        title={'Log out'}
                        hasNoBorder
                        onPress={this.props.logout}
                    />
                </View>
            </Updater>
        );
    },
}));
