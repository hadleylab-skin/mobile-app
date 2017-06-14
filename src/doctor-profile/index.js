import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Image,
} from 'react-native';
import { Title } from 'components/new/title';
import { InfoField, Switch } from 'components';
import defaultUserImage from 'components/icons/empty-photo/empty-photo.png';
import s from './styles';

export const DoctorProfile = React.createClass({
    propTypes: {
        doctorCursor: BaobabPropTypes.cursor.isRequired,
        logout: React.PropTypes.func.isRequired,
    },

    contextTypes: {
        services: React.PropTypes.shape({
            updateDoctorService: React.PropTypes.func.isRequired,
        }),
    },

    async onUnitsOfLengthChange(unit) {
        const service = this.context.services.updateDoctorService;
        const unitsOfLengthCursor = this.props.doctorCursor.select('data', 'unitsOfLength');

        if (unit === unitsOfLengthCursor.get()) {
            return;
        }

        unitsOfLengthCursor.set(unit);
        await service(this.props.doctorCursor, { unitsOfLength: unit });
    },

    render() {
        const { photo, degree, department } = this.props.doctorCursor.get('data');

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
                                cursor={this.props.doctorCursor.select('data', 'unitsOfLength')}
                                disabled={this.props.doctorCursor.get('status') === 'Loading'}
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
                        onPress={this.props.logout}
                    />
                </View>
            </View>
        );
    },
});
