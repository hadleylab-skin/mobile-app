import React from 'react';
import {
    View,
    StatusBar,
    TabBarIOS,
    NavigatorIOS,
} from 'react-native';
import { uploadClinicalPhoto, getPatientList, createPatient, getPatient } from 'libs/services/patients';
import schema from 'libs/state';
import CameraScreen from '../camera';
import { PatientsList } from '../patients';

const model = (props) => (
    {
        tree: {
            currentTab: 'camera',
            camera: {},
            patients: {},
            patientsImages: {},
            currentPatient: props.defaultPatient,
        },
    }
);

const Main = schema(model)(React.createClass({
    displayName: 'Main',

    propTypes: {},

    render() {
        const currentTabCursor = this.props.tree.currentTab;
        const cameraCursor = this.props.tree.camera;
        const patientsCursor = this.props.tree.patients;
        const patientsImagesCursor = this.props.tree.patientsImages;
        const currentPatientCursor = this.props.tree.currentPatient;
        const token = this.props.token;

        const clinicalPhotoService = uploadClinicalPhoto(
             token,
             currentPatientCursor.get('id'));
        const patientsService = getPatientList(token);
        const createPatientService = createPatient(token);

        return (
            <View style={{ flex: 1 }}>
                <StatusBar hidden={currentTabCursor.get() === 'camera'} />
                <TabBarIOS
                    barTintColor="#fafafa"
                    tintColor="#FF2D55"
                    unselectedItemTintColor="#8E8E93"
                >
                    <TabBarIOS.Item
                        title="Camera"
                        icon={require('./images/camera.png')}
                        selected={currentTabCursor.get() === 'camera'}
                        onPress={() => currentTabCursor.set('camera')}
                    >
                        <CameraScreen
                            tree={cameraCursor}
                            currentPatient={currentPatientCursor.get()}
                            clinicalPhotoService={clinicalPhotoService}
                            updatePatients={() => {
                                const id = currentPatientCursor.get('id');
                                patientsService(patientsCursor.patients);
                                getPatient(token, id)(patientsImagesCursor.select(id));
                            }}
                        />
                    </TabBarIOS.Item>
                    <TabBarIOS.Item
                        title="Patients"
                        icon={require('./images/social.png')}
                        selected={currentTabCursor.get() === 'patients'}
                        onPress={() => currentTabCursor.set('patients')}
                    >
                        <PatientsList
                            tree={patientsCursor}
                            patientsImages={patientsImagesCursor}
                            changeCurrentPatient={(patient, switchTab = true) => {
                                currentPatientCursor.set(patient);
                                if (switchTab) {
                                    currentTabCursor.set('camera');
                                }
                            }}
                            patientsService={patientsService}
                            createPatientService={createPatientService}
                            mainNavigator={this.props.mainNavigator}
                            token={this.props.token}
                        />
                    </TabBarIOS.Item>
                </TabBarIOS>
            </View>
        );
    },
}));

export default React.createClass({
    displayName: 'MainNavigator',
    render() {
        return (
            <NavigatorIOS
                ref={(ref) => { this.navigator = ref; }}
                initialRoute={{
                    component: Main,
                    title: 'Patients',
                    passProps: { ...this.props, mainNavigator: () => this.navigator },
                    navigationBarHidden: true,
                    tintColor: '#FF2D55',
                }}
                style={{ flex: 1 }}
            />
        );
    },
});
