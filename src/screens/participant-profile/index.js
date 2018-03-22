import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import _ from 'lodash';
import moment from 'moment';
import {
    View,
    Text,
    Image,
} from 'react-native';
import schema from 'libs/state';
import { resetState } from 'libs/tree';
import defaultUserImage from 'components/icons/empty-photo/empty-photo.png';
import { InfoField, Updater, Button } from 'components';
import s from './styles';

const model = {
    tree: {},
};

export const ParticipantProfile = schema(model)(React.createClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        doctorCursor: BaobabPropTypes.cursor.isRequired,
        patientsCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        cursors: React.PropTypes.shape({
            patients: BaobabPropTypes.cursor.isRequired,
        }),
        services: React.PropTypes.shape({
            patientsService: React.PropTypes.func.isRequired,
        }),
    },

    async componentWillMount() {
        const { cursors, services } = this.context;
        await services.patientsService(cursors.patients);
    },

    goEditProfile() {

    },

    render() {
        const patients = this.props.patientsCursor.get();
        if (patients.status !== 'Succeed') {
            return (<View/>);
        }

        console.log(patients.data);
        const patient = _.first(_.values(patients.data)).data;
        console.log(patient);
        const { firstName, lastName, photo, dateOfBirth } = patient;
        const age = dateOfBirth ? parseInt(moment().diff(moment(dateOfBirth), 'years')) : null;

        return (
            <View>
                <View style={s.info}>
                    <Image
                        style={s.photo}
                        source={defaultUserImage}
                    />
                    <View>
                        <Text style={s.name_text}>
                            {`${firstName} ${lastName}`}
                        </Text>
                        {age ?
                            <Text style={s.age_text}>
                                35 years
                            </Text>
                        : null}
                    </View>
                </View>
                <View style={s.button}>
                    <Button title="Edit profile" onPress={this.goEditProfile} />
                </View>

                <View style={s.logout}>
                    <InfoField
                        title={'Log out'}
                        hasNoBorder
                        onPress={resetState}
                    />
                </View>
            </View>
        );
    },
}));
