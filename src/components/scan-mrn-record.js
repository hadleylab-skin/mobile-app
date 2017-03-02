import React from 'react';
import {
  Image,
  TouchableOpacity,
  View,
} from 'react-native';
import Camera from 'react-native-camera';
import s from '../camera/styles';
import captureIcon from '../camera/images/capture.png';


export function ScanMrnRecord({ setupData }, context) {
    let camera;

    async function takePicture() {
        const photo = await camera.capture();
        const data = await context.services.mrnScanerService(photo);
        setupData(data);
    }

    return (
        <View style={s.container}>
            <Camera
                ref={(cam) => {
                    camera = cam;
                }}
                style={s.camera}
                aspect={Camera.constants.Aspect.fill}
                captureTarget={Camera.constants.CaptureTarget.disk}
                onFocusChanged={() => true}
                defaultOnFocusComponent
            >
                <TouchableOpacity onPress={takePicture}>
                    <Image
                        source={captureIcon}
                        style={s.capture}
                    />
                </TouchableOpacity>
            </Camera>
        </View>
    );
}

ScanMrnRecord.contextTypes = {
    services: React.PropTypes.shape({
        mrnScanerService: React.PropTypes.func.isRequired,
    }),
};

ScanMrnRecord.propTypes = {
    setupData: React.PropTypes.func.isRequired,
};
