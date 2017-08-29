import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    StatusBar,
    TabBarIOS,
    NavigatorIOS,
    View,
} from 'react-native';
import { getRacesList } from 'services/constants';
import schema from 'libs/state';
import { ServiceProvider } from 'components';
import { PatientsList } from 'screens/patients-list';
import { DoctorProfile } from 'screens/doctor-profile';
import { CameraMenu } from 'screens/camera-menu';
import { CryptoConfiguration } from 'screens/crypto-config';

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
            filter: {
                pathPending: false,
            },
            search: '',
        },
    }
);

const Main = schema(model)(React.createClass({
    displayName: 'Main',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
    },

    render() {
        const currentTabCursor = this.props.tree.currentTab;
        const patientsCursor = this.props.tree.patients;
        const showModalCursor = this.props.tree.showModal;
        const searchCursor = this.props.tree.search;

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
                        title="My Profile"
                        icon={profileIcon}
                        selected={currentTabCursor.get() === 'profile'}
                        onPress={() => currentTabCursor.set('profile')}
                    >
                        <DoctorProfile
                            tree={this.props.tokenCursor.select('data', 'doctor')}
                            keyPairStatusCursor={this.props.keyPairStatusCursor}
                            logout={() => {
                                this.props.tree.set({});
                                this.props.tokenCursor.set('');
                            }}
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

export default React.createClass({
    displayName: 'MainNavigator',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired,
    },

    childContextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        cursors: React.PropTypes.shape({
            doctor: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
            patientsMoleImages: BaobabPropTypes.cursor.isRequired,
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            racesList: BaobabPropTypes.cursor.isRequired,
            filter: React.PropTypes.object.isRequired, // eslint-disable-line
        }),
    },

    getChildContext() {
        return {
            mainNavigator: this.mainNavigator || {},
            cursors: {
                doctor: this.props.tokenCursor.data.doctor.data,
                patients: this.props.tree.patients,
                patientsMoles: this.props.tree.patientsMoles,
                patientsMoleImages: this.props.tree.patientsMoleImages,
                currentPatientPk: this.props.tree.currentPatientPk,
                racesList: this.props.tree.racesList,
                filter: this.props.tree.racesList,
            },
        };
    },

    render() {
        const keyPairStatusCursor = this.props.keyPairStatusCursor;
        return (
            <ServiceProvider
                token={this.props.tokenCursor.get('data')}
                style={{ flex: 1 }}
            >

                {
                    keyPairStatusCursor.get('status') !== 'Exists'
                    ?
                    (
                        <CryptoConfiguration
                            doctorCursor={this.props.tokenCursor.data.doctor}
                            keyPairStatusCursor={keyPairStatusCursor}
                        />
                    )
                    :
                    (
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
                    )
                }
            </ServiceProvider>
        );
    },
});
