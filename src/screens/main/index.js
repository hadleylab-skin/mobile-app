import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import { getRacesList } from 'services/constants';
import { ServiceProvider } from 'components';
import { PatientsList } from 'screens/patients-list';
import { DoctorProfile } from 'screens/doctor-profile';
import { ParticipantProfile } from 'screens/participant-profile';
import { CameraMenu } from 'screens/camera-menu';
import { CryptoConfiguration } from 'screens/crypto-config';
import { CreateOrEditPatient } from 'screens/create-or-edit';
import Main from './main';
import MainNavigatorProvider from './main-navigator-provider';


export default React.createClass({
    displayName: 'MainNavigator',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired,
    },

    childContextTypes: {
        cursors: React.PropTypes.shape({
            doctor: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
            patientsMoleImages: BaobabPropTypes.cursor.isRequired,
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            currentStudyPk: BaobabPropTypes.cursor.isRequired,
            racesList: BaobabPropTypes.cursor.isRequired,
            filter: React.PropTypes.object.isRequired, // eslint-disable-line
        }),
    },

    getChildContext() {
        return {
            cursors: {
                doctor: this.props.tokenCursor.data.doctor.data,
                patients: this.props.tree.patients,
                patientsMoles: this.props.tree.patientsMoles,
                patientsMoleImages: this.props.tree.patientsMoleImages,
                currentPatientPk: this.props.tree.currentPatientPk,
                currentStudyPk: this.props.tree.currentStudyPk,
                racesList: this.props.tree.racesList,
                filter: this.props.tree.filter,
            },
        };
    },

    renderContent() {
        const keyPairStatusCursor = this.props.keyPairStatusCursor;
        const { status, firstTime } = keyPairStatusCursor.get();

        if (status !== 'Succeed' && firstTime) {
            if (status === 'Loading') {
                return null;
            } else {
                return (
                    <CryptoConfiguration
                        standAlone
                        doctorCursor={this.props.tokenCursor.data.doctor}
                        keyPairStatusCursor={keyPairStatusCursor}
                    />
                )
            }
        } else {
            return (
                <MainNavigatorProvider
                    initialRoute={{
                        component: Main,
                        title: 'Patients',
                        navigationBarHidden: true,
                        tintColor: '#FF2D55',
                        passProps: this.props,
                    }}
                    style={{ flex: 1 }}
                    barTintColor="#fff"
                />
            );
        }
    },

    render() {
        return (
            <ServiceProvider
                token={this.props.tokenCursor.data}
                style={{ flex: 1 }}
            >
                {this.renderContent()}
            </ServiceProvider>
        );
    },
});
