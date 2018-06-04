import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import { getRacesList } from 'services/constants';
import { getSavedCurrentStudyService } from 'services/async-storage';
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
            currentStudyPk: getSavedCurrentStudyService,
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

export default schema(model)(createReactClass({
    displayName: 'Main',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired, // eslint-disable-line
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired, // eslint-disable-line
        tokenCursor: BaobabPropTypes.cursor.isRequired,// eslint-disable-line
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired, // eslint-disable-line
        services: PropTypes.shape({
            getSiteJoinRequestsService: PropTypes.func.isRequired,
            createPatientService: PropTypes.func.isRequired,
        }),
        cursors: PropTypes.shape({
            doctor: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
        }),
    },

    render() {
        const doctor = this.context.cursors.doctor.get();
        const currentStudyPk = this.props.tree.currentStudyPk.get();
        if (currentStudyPk.status === 'Loading') {
            return null;
        }

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
