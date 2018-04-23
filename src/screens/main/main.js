import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import { getRacesList } from 'services/constants';
import schema from 'libs/state';
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
    };
};

export default schema(model)(React.createClass({
    displayName: 'Main',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired, // eslint-disable-line
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired, // eslint-disable-line
        tokenCursor: BaobabPropTypes.cursor.isRequired,// eslint-disable-line
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
            );
        }

        return (
            <MainDoctor
                {...this.props}
            />
        );
    },
}));
