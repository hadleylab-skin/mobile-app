import React from 'react';
import {
    View,
    StyleSheet,
    TabBarIOS,
} from 'react-native';
import { uploadClinicalPhoto } from 'libs/services/patients';
import schema from 'libs/state';
import CameraScreen from '../camera';

const model = (props) => (
    {
        tree: {
            currentTab: 'camera',
            camera: {},
            currentPatient: props.defaultPatient,
        },
    }
);

export default schema(model)(React.createClass({
    displayName: 'Main',

    propTypes: {},


    render() {
        const currentTabCursor = this.props.tree.currentTab;
        const cameraCursor = this.props.tree.camera;
        const currentPatient = this.props.tree.currentPatient.get();

        const clinicalPhotoService = uploadClinicalPhoto(
            this.props.token,
            currentPatient.pk);

        return (
            <TabBarIOS
                barTintColor="#fafafa"
                tintColor="#FF3952"
                unselectedItemTintColor="#333">
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
                    <View style={{ flex: 1, backgroundColor: '#783E33' }} />
                </TabBarIOS.Item>
            </TabBarIOS>
        );
    },
}));

const styles = StyleSheet.create({
    image: {
        marginLeft: 30,
        marginRight: 30,
    },
});
