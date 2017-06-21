import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    StatusBar,
    TabBarIOS,
    NavigatorIOS,
    View,
} from 'react-native';
import _ from 'lodash';
import services from 'libs/services';
import { getRacesList } from 'libs/services/constants';
import schema from 'libs/state';
import { ServiceProvider } from 'components';
import { PatientsList } from '../patients';
import { DoctorProfile } from '../doctor-profile';
import { Camera } from '../camera';

import patientsIcon from './images/patients.png';
import cameraIcon from './images/camera.png';
import profileIcon from './images/profile.png';

const model = (props) => (
    {
        tree: {
            currentTab: 'patients',
            currentPatientPk: null,
            patients: {},
            patientsMoles: {},
            patientsMoleImages: {},
            racesList: getRacesList(props.token),
            showModal: false,
        },
    }
);

const Main = schema(model)(React.createClass({
    displayName: 'Main',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
    },

    render() {
        const currentTabCursor = this.props.tree.currentTab;
        const patientsCursor = this.props.tree.patients;
        const patientsMolesCursor = this.props.tree.patientsMoles;
        const showModalCursor = this.props.tree.showModal;

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
                            patientsMolesCursor={patientsMolesCursor}
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
                        title="My Profile"
                        icon={profileIcon}
                        selected={currentTabCursor.get() === 'profile'}
                        onPress={() => currentTabCursor.set('profile')}
                    >
                        <DoctorProfile
                            tree={this.props.tokenCursor.select('data', 'doctor')}
                            logout={() => {
                                this.props.tree.set({});
                                this.props.tokenCursor.set('');
                            }}
                        />
                    </TabBarIOS.Item>
                </TabBarIOS>
                <Camera
                    tree={this.props.tree}
                    visibleCursor={showModalCursor}
                    patientsList={this.patientsList}
                />
            </View>
        );
    },
}));

export default React.createClass({
    displayName: 'MainNavigator',

    propTypes: {
        tokenCursor: BaobabPropTypes.cursor.isRequired,
    },

    childContextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        user: BaobabPropTypes.cursor.isRequired,
        patients: BaobabPropTypes.cursor.isRequired,
        patientsMoles: BaobabPropTypes.cursor.isRequired,
        patientsMoleImages: BaobabPropTypes.cursor.isRequired,
        currentPatientPk: BaobabPropTypes.cursor.isRequired,
        racesList: BaobabPropTypes.cursor.isRequired,
    },

    getChildContext() {
        return {
            mainNavigator: this.mainNavigator || {},
            user: this.props.tokenCursor.select('data', 'doctor', 'data'),
            patients: this.props.tree.patients,
            patientsMoles: this.props.tree.patientsMoles,
            patientsMoleImages: this.props.tree.patientsMoleImages,
            currentPatientPk: this.props.tree.currentPatientPk,
            racesList: this.props.tree.racesList,
        };
    },

    initServices() {
        const token = this.props.tokenCursor.get('data', 'token');
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
                        navigationBarHidden: true,
                        tintColor: '#FF2D55',
                        passProps: this.props,
                    }}
                    style={{ flex: 1 }}
                    barTintColor="#fff"
                />
            </ServiceProvider>
        );
    },
});
