import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    StatusBar,
    TabBarIOS,
    View,
    ActivityIndicator,
} from 'react-native';
import schema from 'libs/state';
import { ParticipantProfile } from 'screens/participant-profile';
import { getAnatomicalSiteWidgetRoute } from 'screens/anatomical-site-widget';
import { CreateOrEditPatient } from 'screens/create-or-edit';

import ParticipantDecryptionError from './participant-decryption-error';

import cameraIcon from './images/camera.png';
import profileIcon from './images/profile.png';


const model = {
    newPatientScreen: {},
    addMoleScreen: {},
    participantScreen: {},

    studies: {},
};


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
        }),
    },

    async componentWillMount() {
        const { cursors, services } = this.context;
        const patients = await services.patientsService(cursors.patients);

        if (patients && patients.status === 'Succeed' && !_.isEmpty(patients.data)) {
            const patient = _.first(_.values(patients.data)).data;
            cursors.currentPatientPk.set(patient.pk);
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

    cameraPressed() {
        const patients = this.context.cursors.patients.get();
        const patient = _.get(_.first(_.values(patients.data)), 'data');

        this.context.mainNavigator.push(
            getAnatomicalSiteWidgetRoute({
                tree: this.props.tree.addMoleScreen,
                sex: patient ? patient.sex : 'm',
                onAddingComplete: this.onAddingMoleComplete,
                rightButtonTitle: '',
            }, this.context)
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

    render() {
        const patients = this.context.cursors.patients.get();
        if (patients.status === 'Loading') {
            return (
                <ActivityIndicator />
            );
        }

        const isNeedCreateFirstPatient = patients &&
            patients.status === 'Succeed' && _.isEmpty(patients.data);

        if (isNeedCreateFirstPatient) {
            return this.renderCreatePatient();
        } else {
            return this.renderMain();
        }
    },
}));
