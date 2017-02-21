import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import _ from 'lodash';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    TouchableWithoutFeedback,
} from 'react-native';
import schema from 'libs/state';
import Camera from 'react-native-camera';
import s from './styles';
import captureIcon from './images/capture.png';

const ImageLoader = React.createClass({
    propTypes: {
        imageInfo: React.PropTypes.shape({
            photo: React.PropTypes.shape({
                path: React.PropTypes.string.isRequired,
            }),
            data: React.PropTypes.shape({
                status: React.PropTypes.string.isRequired,
            }),
        }).isRequired,
        index: React.PropTypes.number.isRequired,
        deleteImage: React.PropTypes.func.isRequired,
    },

    renderImage(path) {
        return (
            <Image
                style={{ height: 75, width: 50 }}
                source={{ uri: path }}
            />
        );
    },

    render() {
        const { imageInfo, deleteImage, index } = this.props;

        if (!imageInfo.data) {
            return null;
        }

        if (imageInfo.data.status === 'Loading') {
            return (
                <View style={s.wrapper}>
                    {this.renderImage(imageInfo.photo.path)}
                    <ActivityIndicator
                        size="large"
                        color="#FF2D55"
                        style={{ position: 'absolute', top: 20, left: 10 }}
                    />
                </View>
            );
        } else if (imageInfo.data.status === 'Succeed') {
            setTimeout(() => deleteImage(index), 10000);

            return (
                <View style={s.wrapper}>
                    {this.renderImage(imageInfo.photo.path)}
                    <View style={s.success} />
                </View>
            );
        }

        return (
            <TouchableWithoutFeedback
                onPress={() => Alert.alert(
                    'Loading Image Error',
                    JSON.stringify(imageInfo.data),
                    [
                        { text: 'OK', onPress: () => deleteImage(index) },
                    ]
                )}
            >
                <View style={s.wrapper}>
                    {this.renderImage(imageInfo.photo.path)}
                    <View style={s.error}>
                        <Text style={{ color: '#fff' }}>Error</Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    },
});

const model = {
    tree: {
        imageUploadResults: [],
    },
};

export default schema(model)(React.createClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        updatePatients: React.PropTypes.func.isRequired,
        currentPatient: React.PropTypes.shape({
            id: React.PropTypes.number.isRequired,
            firstname: React.PropTypes.string.isRequired,
            lastname: React.PropTypes.string.isRequired,
        }).isRequired,
        switchTab: React.PropTypes.func.isRequired,
    },

    async takePicture() {
        const photo = await this.camera.capture();
        const index = this.props.tree.imageUploadResults.get().length;
        this.props.tree.imageUploadResults.push({
            photo,
            data: {},
        });
        const cursor = this.props.tree.imageUploadResults.select(index, 'data');
        await this.props.clinicalPhotoService(cursor, photo);
        this.props.updatePatients();
    },

    deleteImage(index) {
        this.props.tree.imageUploadResults.splice([index, 1]);
    },

    render() {
        const patientName = `${this.props.currentPatient.firstname} ${this.props.currentPatient.lastname}`;
        const images = this.props.tree.imageUploadResults.get();

        return (
            <View style={s.container}>
                <Camera
                    ref={(cam) => {
                        this.camera = cam;
                    }}
                    style={s.camera}
                    aspect={Camera.constants.Aspect.fill}
                    captureTarget={Camera.constants.CaptureTarget.disk}
                    onFocusChanged={() => true}
                    defaultOnFocusComponent
                >
                    <View style={s.preloaders} >
                        {_.map(images, (imageInfo, index) =>
                            <ImageLoader
                                tree={this.props.tree.imageUploadResults.select(index)}
                                imageInfo={imageInfo}
                                key={imageInfo.photo.path}
                                index={index}
                                deleteImage={this.deleteImage}
                            />
                        )}
                    </View>
                    <TouchableWithoutFeedback onPress={this.props.switchTab}>
                        <View style={s.textWrapper}>
                            <Text style={s.name}>
                                {patientName}
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableOpacity onPress={this.takePicture}>
                        <Image
                            source={captureIcon}
                            style={s.capture}
                        />
                    </TouchableOpacity>
                </Camera>
            </View>
        );
    },
}));
