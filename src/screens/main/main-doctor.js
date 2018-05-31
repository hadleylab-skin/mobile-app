import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    StatusBar,
    TabBarIOS,
    View,
} from 'react-native';
import schema from 'libs/state';
import { PatientsList } from 'screens/patients-list';
import { DoctorProfile } from 'screens/doctor-profile';
import { CameraMenu } from 'screens/camera-menu';

import patientsIcon from './images/patients.png';
import cameraIcon from './images/camera.png';
import profileIcon from './images/profile.png';


export default schema({})(createReactClass({
    displayName: 'MainDoctor',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
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
        const currentTabCursor = this.props.tree.currentTab;
        const patientsCursor = this.props.tree.patients;
        const showModalCursor = this.props.tree.showModal;
        const searchCursor = this.props.tree.search;

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
                <StatusBar barStyle={statusBarStyle} />
                <TabBarIOS
                    barTintColor="#fff"
                    tintColor="#FC3159"
                    unselectedItemTintColor="#ACB5BE"
                >
                    <TabBarIOS.Item
                        title="Patients"
                        icon={patientsIcon}
                        selected={currentTabCursor.get() === 'patients'}
                        onPress={() => currentTabCursor.set('patients')}
                    >
                        <PatientsList
                            ref={(ref) => {
                                this.patientsList = ref;
                            }}
                            tree={patientsCursor}
                            searchCursor={searchCursor}
                        />
                    </TabBarIOS.Item>
                    <TabBarIOS.Item
                        title="Camera"
                        icon={cameraIcon}
                        selected={false}
                        onPress={() => showModalCursor.set(true)}
                    >
                        <View />
                    </TabBarIOS.Item>
                    <TabBarIOS.Item
                        badge={siteJoinRequireAction ? '!' : null}
                        title="My Profile"
                        icon={profileIcon}
                        selected={currentTabCursor.get() === 'profile'}
                        onPress={() => currentTabCursor.set('profile')}
                    >
                        <DoctorProfile
                            tree={this.props.tree.doctorScreenState}
                            doctorCursor={this.props.tokenCursor.data.doctor}
                            keyPairStatusCursor={this.props.keyPairStatusCursor}
                            siteJoinRequestCursor={this.props.tree.siteJoinRequest}
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
}));
