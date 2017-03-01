import React from 'react';
import {
  Image,
  TouchableOpacity,
  View,
} from 'react-native';
import Camera from 'react-native-camera';
import { mrnScanerService } from 'libs/services/mrn-scaner';
import s from '../camera/styles';
import captureIcon from '../camera/images/capture.png';


export function ScanMrnRecord({ setupData }) {
    let camera;

    async function takePicture() {
        const photo = await camera.capture();
        const data = await mrnScanerService(photo);
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
