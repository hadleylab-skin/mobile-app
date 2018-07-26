import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    StatusBar,
    TabBarIOS,
    View,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    Text,
} from 'react-native';
import { Button } from 'components';
import schema from 'libs/state';
import { resetState } from 'libs/tree';
import { isStudyConsentExpired } from 'libs/misc';
import { ParticipantProfile } from 'screens/participant-profile';
import { getAnatomicalSiteWidgetRoute } from 'screens/anatomical-site-widget';
import { CreateOrEditPatient } from 'screens/create-or-edit';
import { TutorialScreen } from 'screens/tutorial';

import {
    hasSavedStudy,
    saveCurrentStudy,
    getTutorialPassedFlag,
} from 'services/async-storage';

import ParticipantDecryptionError from './participant-decryption-error';

import cameraIcon from './images/camera.png';
import profileIcon from './images/profile.png';

import s from './styles';


const model = (props, context) => ({
    tree: {
        newPatientScreen: {},
        addMoleScreen: {},
        participantScreen: {},

        studies: {},
        invites: context.services.getInvitesService,
        tutorialPassed: (cursor) => getTutorialPassedFlag(cursor, context.cursors.doctor.get('pk')),
    },
});


export default schema(model)(createReactClass({
    displayName: 'MainParticipant',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,  // eslint-disable-line
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired, // eslint-disable-line
        cursors: PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            currentStudyPk: BaobabPropTypes.cursor.isRequired,
            doctor: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
        }),
        services: PropTypes.shape({
            getSiteJoinRequestsService: PropTypes.func.isRequired,
            createPatientService: PropTypes.func.isRequired,
            patientsService: PropTypes.func.isRequired,
            getPatientMolesService: PropTypes.func.isRequired,
            getInvitesService: PropTypes.func.isRequired,
        }),
    },

    async componentWillMount() {
        const { cursors, services } = this.context;
        const patients = await services.patientsService(cursors.patients);

        if (patients && patients.status === 'Succeed' && !_.isEmpty(patients.data)) {
            const patient = _.first(_.values(patients.data)).data;
            cursors.currentPatientPk.set(patient.pk);
        }

        const studies = await services.getStudiesService(this.props.tree.studies);

        if (!await hasSavedStudy()) {
            const firstStudy = _.first(studies.data);
            if (firstStudy) {
                cursors.currentStudyPk.set({
                    data: firstStudy.pk,
                    status: 'Succeed',
                });
                saveCurrentStudy(firstStudy.pk);
            }
        }
    },

    async onAddingMoleComplete() {
        const { cursors, services } = this.context;
        const currentPatientPk = cursors.currentPatientPk.get();

        const result = await services.getPatientMolesService(
            currentPatientPk,
            this.props.tree.participantScreen.moles,
            cursors.currentStudyPk.get('data'));
        cursors.patientsMoles.select(currentPatientPk, 'moles').set(result);

        this.context.mainNavigator.popToTop();
    },

    cameraPressed() {
        const patients = this.context.cursors.patients.get();
        const patient = _.get(_.first(_.values(patients.data)), 'data');

        const studies = this.props.tree.studies.get('data');
        if (isStudyConsentExpired(
            studies,
            this.context.cursors.currentStudyPk.get('data'),
            patient.pk)
        ) {
            Alert.alert(
                'Study consent expired',
                'You need to re-sign study consent to add new images'
            );

            return;
        }

        this.context.mainNavigator.push(
            getAnatomicalSiteWidgetRoute({
                tree: this.props.tree.addMoleScreen,
                sex: patient ? patient.sex : 'm',
                onAddingComplete: this.onAddingMoleComplete,
                rightButtonTitle: '',
            }, this.context)
        );
    },

    checkIfDoctorNeedToApprove() {
        const invites = this.props.tree.invites.get('data');
        const newInvites = _.filter(invites,
            (invite) => invite.status === 'new' && invite.patient);

        return newInvites.length > 0;
    },

    renderCreatePatient() {
        return (
            <CreateOrEditPatient
                tree={this.props.tree.newPatientScreen}
                service={this.context.services.createPatientService}
                navigator={this.context.mainNavigator}
                onActionComplete={(patient) => {
                    this.context.cursors.currentPatientPk.set(patient.pk);
                    this.context.cursors.patients.data.set(patient.pk, {
                        status: 'Succeed',
                        data: patient,
                    });
                    this.context.mainNavigator.popToTop();
                }}
            />
        );
    },

    renderMain() {
        const currentTabCursor = this.props.tree.currentTab;

        const statusBarStyle = currentTabCursor.get() === 'profile' ? 'light-content' : 'default';
        const patients = this.context.cursors.patients.get();
        if (patients.status === 'Failure' && patients.error === 'patient_decryption_error') {
            return (
                <ParticipantDecryptionError />
            );
        }

        return (
            <View
                style={{ flex: 1 }}
            >
                <StatusBar barStyle={statusBarStyle} />
                <TabBarIOS
                    barTintColor="#fff"
                    tintColor="#FC3159"
                    unselectedItemTintColor="#ACB5BE"
                >
                    <TabBarIOS.Item
                        title="My Profile"
                        icon={profileIcon}
                        selected={currentTabCursor.get() === 'profile'}
                        onPress={() => currentTabCursor.set('profile')}
                    >
                        <ParticipantProfile
                            tree={this.props.tree.participantScreen}
                            studiesCursor={this.props.tree.studies}
                            doctorCursor={this.props.tokenCursor.data.doctor}
                            keyPairStatusCursor={this.props.keyPairStatusCursor}
                        />
                    </TabBarIOS.Item>
                    <TabBarIOS.Item
                        title="Camera"
                        icon={cameraIcon}
                        selected={false}
                        onPress={this.cameraPressed}
                    >
                        <View />
                    </TabBarIOS.Item>
                </TabBarIOS>
            </View>
        );
    },

    renderLockScreen() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={s.participantLockWrapper}>
                    <Text style={s.participantLockText}>
                        Please wait for approving by the doctor
                    </Text>
                    <View style={s.participantLockButton}>
                        <Button
                            title="Log out"
                            onPress={resetState}
                        />
                    </View>
                </View>
            </SafeAreaView>
        );
    },

    render() {
        const tutorialPassed = this.props.tree.tutorialPassed.get();
        if (tutorialPassed.status === 'Loading') {
            return null;
        }

        if (tutorialPassed.data === null) {
            return (
                <TutorialScreen
                    type={'participant'}
                    tutorialPassedCursor={this.props.tree.tutorialPassed}
                />
            );
        }

        const patients = this.context.cursors.patients.get();
        const invites = this.props.tree.invites.get();

        if (patients.status === 'Loading' || invites.status === 'Loading') {
            return (
                <ActivityIndicator />
            );
        }

        const waitForDoctorApprove = this.checkIfDoctorNeedToApprove();

        if (waitForDoctorApprove) {
            return this.renderLockScreen();
        }

        const needToCreatePatient = patients
            && patients.status === 'Succeed' && _.isEmpty(patients.data);

        if (needToCreatePatient) {
            return this.renderCreatePatient();
        }

        return this.renderMain();
    },
}));
