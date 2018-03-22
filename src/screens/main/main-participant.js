import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    StatusBar,
    TabBarIOS,
    NavigatorIOS,
    View,
    Text,
    Modal,
} from 'react-native';
import { getRacesList } from 'services/constants';
import schema from 'libs/state';
import { ServiceProvider } from 'components';
import { PatientsList } from 'screens/patients-list';
import { DoctorProfile } from 'screens/doctor-profile';
import { ParticipantProfile } from 'screens/participant-profile';
import { CameraMenu } from 'screens/camera-menu';
import { CryptoConfiguration } from 'screens/crypto-config';
import { CreateOrEditPatient } from 'screens/create-or-edit';

import cameraIcon from './images/camera.png';
import profileIcon from './images/profile.png';


const model = {
    newPatient: {}
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
        await services.patientsService(cursors.patients);
    },

    renderCreatePatient() {
        return (
            <CreateOrEditPatient
                tree={this.props.tree.newPatient}
                service={this.context.services.createPatientService}
                navigator={this.context.mainNavigator}
                onActionComplete={(patient) => {
                    console.log(patient);
                    this.context.cursors.patients.data.set(patient.pk, {
                        status: 'Succeed',
                        data: patient
                    });
                }}
            />
        );
    },

    renderMain() {
        const currentTabCursor = this.props.tree.currentTab;
        const patientsCursor = this.props.tree.patients;
        const showModalCursor = this.props.tree.showModal;

        const statusBarStyle = currentTabCursor.get() === 'profile' ? 'light-content' : 'default';

        const siteJoinRequireAction = _.chain(this.props.tree.siteJoinRequest.data.get())
                                       .values()
                                       .first()
                                       .get('data.state')
                                       .value() === 2;

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
                            patientsCursor={patientsCursor}
                        />
                    </TabBarIOS.Item>
                    <TabBarIOS.Item
                        title="Camera"
                        icon={cameraIcon}
                        selected={false}
                        onPress={() => showModalCursor.set(true)}
                    >
                        <View/>
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