import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import { getRacesList } from 'services/constants';
import schema from 'libs/state';
import { ServiceProvider } from 'components';
import { PatientsList } from 'screens/patients-list';
import { DoctorProfile } from 'screens/doctor-profile';
import { ParticipantProfile } from 'screens/participant-profile';
import { CameraMenu } from 'screens/camera-menu';
import { CryptoConfiguration } from 'screens/crypto-config';
import { CreateOrEditPatient } from 'screens/create-or-edit';

import MainDoctor from './main-doctor';
import MainParticipant from './main-participant';

const model = (props, context) => {
    const { isParticipant } = props.tokenCursor.data.doctor.data.get();

    return {
        tree: {
            doctorScreenState: {},
            participantScreenState: {},
            siteJoinRequest: context.services.getSiteJoinRequestsService,
            currentTab: isParticipant ? 'profile' : 'patients',
            currentPatientPk: null,
            currentStudyPk: null,
            patients: {},
            patientsMoles: {},
            patientsMoleImages: {},
            racesList: getRacesList(),
            showModal: false,
            filter: {
                pathPending: false,
            },
            search: '',
        },
    }
};

export default schema(model)(React.createClass({
    displayName: 'Main',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        services: React.PropTypes.shape({
            getSiteJoinRequestsService: React.PropTypes.func.isRequired,
            createPatientService: React.PropTypes.func.isRequired,
        }),
        cursors: React.PropTypes.shape({
            doctor: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
        }),
    },

    render() {
        const doctor = this.context.cursors.doctor.get();

        if (doctor.isParticipant) {
            return (
                <MainParticipant
                    {...this.props}
                />
            )
        } else {
            return (
                <MainDoctor
                    {...this.props}
                />
            );
        }
    },
}));