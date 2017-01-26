import React from 'react';
import _ from 'lodash';
import {
    Dimensions,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import schema from 'libs/state';
import Camera from 'react-native-camera';
import Footer from '../footer';

const model = {
    tree: {
        photoUploadResult: {},
    },
};

export default schema(model)(React.createClass({
    getInitialState() {
        return {
            photosInProgress: 0,
        };
    },

    async takePicture() {
        const data = await this.camera.capture();
        this.setState({ photosInProgress: this.state.photosInProgress + 1 });
        try {
            const response = await this.props.clinicalPhotoService(this.props.tree.photoUploadResult, data);
            console.log(response);
        } catch (e) {
            console.log(e);
        }

        this.setState({ photosInProgress: this.state.photosInProgress - 1 });
    },

    render() {
        const patientName = `${this.props.currentPatient.firstname} ${this.props.currentPatient.lastname}`;
        return (
            <View style={styles.container}>
                <StatusBar hidden />
                <Camera
                    ref={(cam) => {
                        this.camera = cam;
                    }}
                    style={styles.preview}
                    aspect={Camera.constants.Aspect.fill}
                    captureTarget={Camera.constants.CaptureTarget.disk}
                >
                    <View style={styles.preloaders} >
                        {_.map(_.range(this.state.photosInProgress), (index) => (
                            <ActivityIndicator key={index} />)
                         )}
                    </View>
                    <View style={styles.textWrapper}>
                        <Text style={styles.name}>
                            {patientName}
                        </Text>
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
}));

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
    preloaders: {
        position: 'absolute',
        flexDirection: 'row',
        top: 40,
        left: 100,
        right: 100,
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
