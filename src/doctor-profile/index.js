import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Image,
    Alert,
} from 'react-native';
import { UserPropType } from 'libs/misc';
import { Title } from 'components/new/title';
import { InfoField, Switch } from 'components';
import defaultUserImage from 'components/icons/empty-photo/empty-photo.png';
import s from './styles';

export const DoctorProfile = React.createClass({
    propTypes: {
        unitsOfLengthCursor: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        user: UserPropType,
        services: React.PropTypes.shape({
            updateDoctorService: React.PropTypes.func.isRequired,
        }),
    },

    async onUnitsOfLengthChange(unit) {
        const service = this.context.services.updateDoctorService;
        const result = await service(this.props.unitsOfLengthCursor, { unitsOfLength: unit })
            .then(() => this.props.unitsOfLengthCursor.set(unit));

        if (result.status === 'Failure') {
            Alert.alert(
                'Update Units Of Length Error',
                JSON.stringify(result.error));
        }
    },

    render() {
        const { photo, degree, department } = this.context.user;

        return (
            <View style={s.container}>
                <View style={s.info}>
                    <Image
                        style={s.photo}
                        source={!_.isEmpty(photo) ? { uri: photo.thumbnail } : defaultUserImage}
                    />
                    {degree ?
                        <View>
                            <Text style={s.degree}>{degree}</Text>
                        </View>
                    : null}
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
                                cursor={this.props.unitsOfLengthCursor}
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
                <View style={s.logout}>
                    <InfoField
                        title={'Log out'}
                        hasNoBorder
                        onPress={() => {
                            this.props.tree.set({});
                            this.props.tokenCursor.set('');
                        }}
                    />
                </View>
            </View>
        );
    },
});
