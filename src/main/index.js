import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    StatusBar,
    TabBarIOS,
    NavigatorIOS,
    View,
    Text,
} from 'react-native';
import _ from 'lodash';
import services from 'libs/services';
import { getRacesList, getAnatomicalSiteList } from 'libs/services/constants';
import schema from 'libs/state';
import { UserPropType } from 'libs/misc';
import { ServiceProvider } from 'components';
import { PatientsList } from '../patients';
import { DoctorProfile } from '../doctor-profile';

import patientsIcon from './images/patients.png';
import cameraIcon from './images/camera.png';
import profileIcon from './images/profile.png';

const model = (props) => (
    {
        tree: {
            currentTab: 'patients',
            patients: {},
            patientsImages: {},
            currentPatient: {},
            racesList: getRacesList(props.token),
            anatomicalSiteList: getAnatomicalSiteList(props.token),
        },
    }
);

const Main = schema(model)(React.createClass({
    displayName: 'Main',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        unitsOfLengthCursor: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
    },

    switchTab() {
        const currentTabCursor = this.props.tree.currentTab;
        currentTabCursor.set('patients');

        this.patientsList.navigator.popToTop();
    },

    render() {
        const currentTabCursor = this.props.tree.currentTab;
        const patientsCursor = this.props.tree.patients;
        const patientsImagesCursor = this.props.tree.patientsImages;
        const currentPatientCursor = this.props.tree.currentPatient;

        const statusBarStyle = currentTabCursor.get() === 'profile' ? 'light-content' : 'default';

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
                            ref={(ref) => { this.patientsList = ref; }}
                            tree={patientsCursor}
                            patientsImagesCursor={patientsImagesCursor}
                            racesList={this.props.tree.racesList.get('data') || []}
                            anatomicalSiteList={this.props.tree.anatomicalSiteList.get('data') || []}
                            currentPatientCursor={currentPatientCursor}
                        />
                    </TabBarIOS.Item>
                    <TabBarIOS.Item
                        title="Camera"
                        icon={cameraIcon}
                        selected={currentTabCursor.get() === 'camera'}
                        onPress={() => currentTabCursor.set('camera')}
                    >
                        <View><Text>Camera</Text></View>
                    </TabBarIOS.Item>
                    <TabBarIOS.Item
                        title="My Profile"
                        icon={profileIcon}
                        selected={currentTabCursor.get() === 'profile'}
                        onPress={() => currentTabCursor.set('profile')}
                    >
                        <DoctorProfile
                            tree={this.props.tree}
                            unitsOfLengthCursor={this.props.unitsOfLengthCursor}
                            tokenCursor={this.props.tokenCursor}
                        />
                    </TabBarIOS.Item>
                </TabBarIOS>
            </View>
        );
    },
}));

export default React.createClass({
    displayName: 'MainNavigator',

    propTypes: {
        token: React.PropTypes.string.isRequired,
        user: UserPropType,
    },

    childContextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        user: UserPropType,
    },

    getChildContext() {
        return {
            mainNavigator: this.mainNavigator || {},
            user: this.props.user,
        };
    },

    initServices() {
        const token = this.props.token;
        let initializedServices = {};
        _.each(services, (service, name) => {
            initializedServices[name] = service(token);
        });
        return initializedServices;
    },

    render() {
        return (
            <ServiceProvider
                style={{ flex: 1 }}
                services={this.initServices()}
            >
                <NavigatorIOS
                    ref={(ref) => { this.mainNavigator = ref; }}
                    initialRoute={{
                        component: Main,
                        title: 'Patients',
                        passProps: this.props,
                        navigationBarHidden: true,
                        tintColor: '#FF2D55',
                    }}
                    style={{ flex: 1 }}
                    barTintColor="#fff"
                />
            </ServiceProvider>
        );
    },
});
