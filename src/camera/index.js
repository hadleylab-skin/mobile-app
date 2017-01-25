import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    StatusBar,
} from 'react-native';
import tree from 'libs/tree';
import { uploadClinicalPhoto } from 'libs/services/patients';
import schema from 'libs/state';
import Camera from 'react-native-camera';
import Footer from '../footer';

export function CameraScreen(props) {
    const token = tree.token.data.token.get();
    const model = {
        tree: {
            currentPatient: null,
            photoUploadResult: {},
        },
    };
    const patientsScreenCursor = tree.patients;
    const clinicalPhotoService = uploadClinicalPhoto(token, patientsScreenCursor.currentPatient.get('pk'));
    const Component = schema(model)(CameraComponent);

    return (
        <Component
            {...props}
            tree={patientsScreenCursor}
            clinicalPhotoService={clinicalPhotoService}
        />
    );
}

const CameraComponent = React.createClass({
    async takePicture() {
        const data = await this.camera.capture();
        const response = await this.props.clinicalPhotoService(this.props.tree.photoUploadResult, data);
        console.log(response);
    },

    render() {
        return (
            <View style={styles.container}>
                <StatusBar hidden />
                <Camera
                    ref={(cam) => {
                        this.camera = cam;
                    }}
                    style={styles.preview}
                    aspect={Camera.constants.Aspect.fill}
                >
                    <View style={styles.textWrapper}>
                        <Text style={styles.name}>John Doe</Text>
                    </View>
                    <TouchableOpacity onPress={this.takePicture}>
                        <Image
                            source={require('./images/capture.png')}
                            style={styles.capture}
                        />
                    </TouchableOpacity>
                </Camera>
                <Footer navigator={this.props.navigator} currentTab="camera" />
            </View>
        );
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 49,
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
    },
    textWrapper: {
        position: 'absolute',
        top: 70,
        left: 0,
        right: 0,
    },
    name: {
        color: '#fff',
        fontSize: 30,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    capture: {
        flex: 0,
        padding: 10,
        margin: 40,
    },
});
