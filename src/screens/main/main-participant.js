import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    StatusBar,
    TabBarIOS,
    View,
} from 'react-native';
import { getRacesList } from 'services/constants';
import schema from 'libs/state';
import { ServiceProvider } from 'components';
import { PatientsList } from 'screens/patients-list';
import { DoctorProfile } from 'screens/doctor-profile';
import { ParticipantProfile } from 'screens/participant-profile';
import { CameraMenu } from 'screens/camera-menu';
import { AnatomicalSiteWidget } from 'screens/anatomical-site-widget';
import { CryptoConfiguration } from 'screens/crypto-config';
import { CreateOrEditPatient } from 'screens/create-or-edit';

import cameraIcon from './images/camera.png';
import profileIcon from './images/profile.png';


const model = {
    newPatientScreen: {},
    addMoleScreen: {},
};


export default schema(model)(React.createClass({
    displayName: 'MainParticipant',

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
            patientsService: React.PropTypes.func.isRequired,
        }),
        cursors: React.PropTypes.shape({
            doctor: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
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

    onAddingMoleComplete() {

    },

    renderCreatePatient() {
        return (
            <CreateOrEditPatient
                tree={this.props.tree.newPatientScreen}
                service={this.context.services.createPatientService}
                navigator={this.context.mainNavigator}
                onActionComplete={(patient) => {
                    this.context.cursors.patients.data.set(patient.pk, {
                        status: 'Succeed',
                        data: patient
                    });
                    this.context.mainNavigator.popToTop();
                }}
            />
        );
    },

    renderMain() {
        const currentTabCursor = this.props.tree.currentTab;
        const showModalCursor = this.props.tree.showModal;

        const statusBarStyle = currentTabCursor.get() === 'profile' ? 'light-content' : 'default';

        // TODO maybe cut this down?
        const siteJoinRequireAction = _.chain(this.props.tree.siteJoinRequest.data.get())
                                       .values()
                                       .first()
                                       .get('data.state')
                                       .value() === 2;

        const patients = this.context.cursors.patients.get();
        const patient = _.get(_.first(_.values(patients.data)), 'data');

        return (
            <View
                style={{ flex: 1 }}
            >
                <StatusBar barStyle={statusBarStyle}/>
                <TabBarIOS
                    barTintColor="#fff"
                    tintColor="#FC3159"
                    unselectedItemTintColor="#ACB5BE"
                >
                    <TabBarIOS.Item
                        badge={siteJoinRequireAction ? '!' : null}
                        title="My Profile"
                        icon={profileIcon}
                        selected={currentTabCursor.get() === 'profile'}
                        onPress={() => currentTabCursor.set('profile')}
                    >
                        <ParticipantProfile
                            tree={this.props.tree.participantScreenState}
                            doctorCursor={this.props.tokenCursor.data.doctor}
                        />
                    </TabBarIOS.Item>
                    <TabBarIOS.Item
                        title="Camera"
                        icon={cameraIcon}
                        selected={currentTabCursor.get() === 'camera'}
                        onPress={() => currentTabCursor.set('camera')}
                    >
                        <AnatomicalSiteWidget
                            tree={this.props.tree.addMoleScreen}
                            sex={patient ? patient.sex : 'm'}
                            onAddingComplete={this.onAddingMoleComplete}
                        />
                    </TabBarIOS.Item>
                </TabBarIOS>
                <CameraMenu
                    tree={this.props.tree}
                    visibleCursor={showModalCursor}
                    patientsList={this.patientsList}
                />
            </View>
        );
    },

    render() {
        const patients = this.context.cursors.patients.get();

        const isNeedCreateFirstPatient = patients &&
            patients.status === 'Succeed' && _.isEmpty(patients.data);

        if (isNeedCreateFirstPatient) {
            return this.renderCreatePatient();
        } else {
            return this.renderMain();
        }
    }
}));