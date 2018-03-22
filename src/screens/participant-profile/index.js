import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import _ from 'lodash';
import {
    View,
    Text,
    Image,
} from 'react-native';
import schema from 'libs/state';
import { resetState } from 'libs/tree';
import defaultUserImage from 'components/icons/empty-photo/empty-photo.png';
import { InfoField, Updater } from 'components';
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

    render() {
        const { firstName, lastName, photo } = this.props.doctorCursor.get('data');

        return (
            <View>
                <View style={s.info}>
                    <View style={s.pinkBg} />
                    <Image
                        style={s.photo}
                        source={defaultUserImage}
                    />
                    <View style={s.name}>
                        <Text style={s.text}>
                            {`${firstName} ${lastName}`}
                        </Text>
                    </View>
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
