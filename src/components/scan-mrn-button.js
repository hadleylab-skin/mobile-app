import React from 'react';
import { Button } from 'react-native';
import ImagePicker from 'react-native-image-picker';

export function ScanMrnButton({ setupData }) {
    return (
        <Button
            onPress={() => ImagePicker.launchCamera({}, setupData)}
            title="Scan mrn label"
        />
    );
}

ScanMrnButton.propTypes = {
    setupData: React.PropTypes.func.isRequired,
};
