import React from 'react';
import _ from 'lodash';
import {
    Dimensions,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import schema from 'libs/state';
import Camera from 'react-native-camera';

function ImageLoader({ imageInfo }) {
    if (!imageInfo.data) {
        return null;
    } if (imageInfo.data.status === 'Loading') {
        return (
            <View style={{ position: 'relative', zIndex: 1 }}>
                <Image
                    style={{ height: 75, width: 50 }}
                    source={{ uri: imageInfo.photo.path }}
                />
                <ActivityIndicator
                    size="large"
                    color="#FF2D55"
                    style={{ position: 'absolute', top: 20, left: 10 }}
                />
            </View>
        );
    } else if (imageInfo.data.status === 'Succeed') {
        return null;
    }

    return (
        <View>
            <Image
                style={{ height: 75, width: 50 }}
                source={{ uri: imageInfo.photo.path }}
            />
            <View style={styles.error}>
                <Text style={{ color: '#fff' }}>Error</Text>
            </View>
        </View>
    );
}

const model = {
    tree: {
        imageUploadResults: [],
    },
};

export default schema(model)(React.createClass({
    async takePicture() {
        const photo = await this.camera.capture();
        const index = this.props.tree.imageUploadResults.get().length;
        this.props.tree.imageUploadResults.push({
            photo,
            data: {},
        });
        const cursor = this.props.tree.imageUploadResults.select(index, 'data');
        try {
            const response = await this.props.clinicalPhotoService(cursor, photo);
            console.log(response);
            this.props.updatePatients();
        } catch (e) {
            console.log(e);
        }
    },

    render() {
        const patientName = `${this.props.currentPatient.firstname} ${this.props.currentPatient.lastname}`;
        const images = this.props.tree.imageUploadResults.get();
        return (
            <View style={styles.container}>
                <Camera
                    ref={(cam) => {
                        this.camera = cam;
                    }}
                    style={styles.camera}
                    aspect={Camera.constants.Aspect.fill}
                    captureTarget={Camera.constants.CaptureTarget.disk}
                >
                    <View style={styles.preloaders} >
                        {_.map(images, (imageInfo, index) =>
                            <ImageLoader imageInfo={imageInfo} key={index} />
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
            </View>
        );
    },
}));

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 49,
    },
    camera: {
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
        top: 10,
        left: 10,
        right: 10,
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
    error: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,45,85,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
