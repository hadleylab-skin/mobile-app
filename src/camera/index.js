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

const imageLoaderModel = {
    tree: {
        errorConfirmed: false,
    },
};

const ImageLoader = schema(imageLoaderModel)(React.createClass({
    propTypes: {
        imageInfo: React.PropTypes.shape({
            photo: React.PropTypes.shape({
                path: React.PropTypes.string.isRequired,
            }),
            data: React.PropTypes.shape({
                status: React.PropTypes.string.isRequired,
            }),
        }).isRequired,
    },

    render() {
        const { imageInfo } = this.props;
        const errorConfirmedCursor = this.props.tree.errorConfirmed;

        if (!imageInfo.data) {
            return null;
        }

        if (imageInfo.data.status === 'Loading') {
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

        if (errorConfirmedCursor.get()) {
            return null;
        }

        return (
            <TouchableWithoutFeedback
                onPress={() => Alert.alert(
                    'Loading Image Error',
                    JSON.stringify(imageInfo.data),
                    [
                        { text: 'OK', onPress: () => errorConfirmedCursor.set(true) },
                    ]
                )}
            >
                <View>
                    <Image
                        style={{ height: 75, width: 50 }}
                        source={{ uri: imageInfo.photo.path }}
                    />
                    <View style={s.error}>
                        <Text style={{ color: '#fff' }}>Error</Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    },
}));

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
                                key={index}
                            />
                        )}
                    </View>
                    <View style={s.textWrapper}>
                        <Text style={s.name}>
                            {patientName}
                        </Text>
                    </View>
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
