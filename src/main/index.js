import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    StatusBar,
    TabBarIOS,
    NavigatorIOS,
} from 'react-native';
import { uploadClinicalPhoto, getPatientList, createPatient,
    getPatientImages, getImage, updatePatient,
    getRacesList, getAnatomicalSites } from 'libs/services/patients';
import schema from 'libs/state';
import CameraScreen from '../camera';
import { PatientsList } from '../patients';
import cameraIcon from './images/camera.png';
import patientsIcon from './images/patients.png';

const model = (props) => (
    {
        tree: {
            currentTab: 'camera',
            camera: {},
            patients: {},
            patientsImages: {},
            currentPatient: props.defaultPatient,
            patient: {},
        },
    }
);

const Main = schema(model)(React.createClass({
    displayName: 'Main',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        token: React.PropTypes.string.isRequired,
        defaultPatient: React.PropTypes.shape({ // eslint-disable-line
            id: React.PropTypes.number.isRequired,
            firstname: React.PropTypes.string.isRequired,
            lastname: React.PropTypes.string.isRequired,
        }).isRequired,
        mainNavigator: React.PropTypes.func.isRequired, // eslint-disable-line
    },

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
        const patientImagesService = getPatientImages(token);
        const imageService = getImage(token);
        const createPatientService = createPatient(token);
        const updatePatientService = updatePatient(token);

        const racesList = getRacesList();
        const anatomicalSites = getAnatomicalSites();

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
                        icon={cameraIcon}
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
                                patientImagesService(id, patientsImagesCursor.select(id));
                            }}
                        />
                    </TabBarIOS.Item>
                    <TabBarIOS.Item
                        title="Patients"
                        icon={patientsIcon}
                        selected={currentTabCursor.get() === 'patients'}
                        onPress={() => currentTabCursor.set('patients')}
                    >
                        <PatientsList
                            tree={patientsCursor}
                            patientsImagesCursor={patientsImagesCursor}
                            changeCurrentPatient={(patient, switchTab = true) => {
                                currentPatientCursor.set(patient);
                                if (switchTab) {
                                    currentTabCursor.set('camera');
                                }
                            }}
                            mainNavigator={this.props.mainNavigator}
                            createPatientService={createPatientService}
                            patientsService={patientsService}
                            patientImagesService={patientImagesService}
                            imageService={imageService}
                            updatePatientService={updatePatientService}
                            racesList={racesList}
                            anatomicalSites={anatomicalSites}
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
