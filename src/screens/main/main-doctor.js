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

import cameraIcon from './images/camera.png';
import profileIcon from './images/profile.png';
import patientsIcon from './images/patients.png';


const model = (props, context) => ({
    tree: {
        studies: context.services.getStudiesService,
        studyInvitations: context.services.getInvitationsForDoctorService,
    },
});


export default schema(model)(createReactClass({
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
            getStudiesService: PropTypes.func.isRequired,
            getInvitationsForDoctorService: PropTypes.func.isRequired,
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
        const studiesCursor = this.props.tree.studies;

        const statusBarStyle = currentTabCursor.get() === 'profile' ? 'light-content' : 'default';

        const siteJoinRequireAction = _.chain(this.props.tree.siteJoinRequest.data.get())
                                       .values()
                                       .first()
                                       .get('data.state')
                                       .value() === 2;

        const studyApprovalRequireAction = _.find(
                this.props.tree.studyInvitations.get('data'),
                (invite) => invite.participant && invite.status === 'new');

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
                            studiesCursor={studiesCursor}
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
                        badge={(siteJoinRequireAction || studyApprovalRequireAction) ? '!' : null}
                        title="My Profile"
                        icon={profileIcon}
                        selected={currentTabCursor.get() === 'profile'}
                        onPress={() => currentTabCursor.set('profile')}
                    >
                        <DoctorProfile
                            tree={this.props.tree.doctorScreenState}
                            studiesCursor={this.props.tree.studies}
                            doctorCursor={this.props.tokenCursor.data.doctor}
                            keyPairStatusCursor={this.props.keyPairStatusCursor}
                            siteJoinRequestCursor={this.props.tree.siteJoinRequest}
                            studyInvitationsCursor={this.props.tree.studyInvitations}
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
