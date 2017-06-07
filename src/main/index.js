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
import { getRacesList, getAnatomicalSiteList } from 'libs/services/constants';
import schema from 'libs/state';
import { UserPropType } from 'libs/misc';
import { ServiceProvider } from 'components';
import CameraScreen from '../camera';
import { PatientsList } from '../patients';
import cameraIcon from './images/camera.png';
import patientsIcon from './images/patients.png';

const model = (props) => (
    {
        tree: {
            currentTab: 'patients',
            camera: {},
            patients: {},
            patientsImages: {},
            currentPatient: props.defaultPatient,
            racesList: getRacesList(props.token),
            anatomicalSiteList: getAnatomicalSiteList(props.token),
        },
    }
);

const Main = schema(model)(React.createClass({
    displayName: 'Main',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        defaultPatient: React.PropTypes.shape({ // eslint-disable-line
            id: React.PropTypes.number.isRequired,
            firstname: React.PropTypes.string.isRequired,
            lastname: React.PropTypes.string.isRequired,
        }).isRequired,
    },

    contextTypes: {
        services: React.PropTypes.shape({
            patientsService: React.PropTypes.func.isRequired,
            patientImagesService: React.PropTypes.func.isRequired,
        }),
    },

    switchTab() {
        const currentTabCursor = this.props.tree.currentTab;
        currentTabCursor.set('patients');

        this.patientsList.navigator.popToTop();
    },

    render() {
        const currentTabCursor = this.props.tree.currentTab;
        const cameraCursor = this.props.tree.camera;
        const patientsCursor = this.props.tree.patients;
        const patientsImagesCursor = this.props.tree.patientsImages;
        const currentPatientCursor = this.props.tree.currentPatient;

        return (
            <View
                style={{ flex: 1 }}
            >
                <StatusBar hidden={currentTabCursor.get() === 'camera'} />
                <TabBarIOS
                    barTintColor="#fafafa"
                    tintColor="#FF2D55"
                    unselectedItemTintColor="#8E8E93"
                >
                    <TabBarIOS.Item
                        title="Camera"
                        icon={cameraIcon}
                        selected={currentTabCursor.get() === 'camera'}
                        onPress={() => currentTabCursor.set('camera')}
                    >
                        {/*<CameraScreen
                            tree={cameraCursor}
                            currentPatient={currentPatientCursor.get()}
                            switchTab={this.switchTab}
                            updatePatients={(id) => {
                                this.context.services.patientsService(patientsCursor.patients);
                                this.context.services.patientImagesService(id, patientsImagesCursor.select(id));
                            }}
                        />*/}
                        <View />
                    </TabBarIOS.Item>
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
                            changeCurrentPatient={(patient, switchTab = true) => {
                                currentPatientCursor.set(patient);
                                if (switchTab) {
                                    currentTabCursor.set('camera');
                                }
                            }}
                            racesList={this.props.tree.racesList.get('data') || []}
                            anatomicalSiteList={this.props.tree.anatomicalSiteList.get('data') || []}
                            currentPatientCursor={currentPatientCursor}
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
                />
            </ServiceProvider>
        );
    },
});
