import React from 'react';
import {
    TabBarIOS,
    NavigatorIOS,
} from 'react-native';
import { uploadClinicalPhoto, getPatientList, createPatient } from 'libs/services/patients';
import schema from 'libs/state';
import CameraScreen from '../camera';
import { PatientsList } from '../patients';

const model = (props) => (
    {
        tree: {
            currentTab: 'camera',
            camera: {},
            patients: {},
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
        const currentPatient = this.props.tree.currentPatient.get();
        const token = this.props.token;

        const clinicalPhotoService = uploadClinicalPhoto(
             token,
            currentPatient.pk);
        const patientsService = getPatientList(token);
        const createPatientService = createPatient(token);

        return (
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
                        currentPatient={currentPatient}
                        clinicalPhotoService={clinicalPhotoService}
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
                        patientsService={patientsService}
                        createPatientService={createPatientService}
                        mainNavigator={this.props.mainNavigator}
                    />
                </TabBarIOS.Item>
            </TabBarIOS>
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
                    title: 'Main',
                    passProps: { ...this.props, mainNavigator: () => this.navigator },
                    navigationBarHidden: true,
                }}
                style={{ flex: 1 }}
            />
        );
    },
});
