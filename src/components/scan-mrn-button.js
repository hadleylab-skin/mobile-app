import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import { Alert, Button } from 'react-native';
import ImagePicker from 'react-native-image-picker';


export function ScanMrnButton({ cursor, setupData }, { services }) {
    async function onResponse(response) {
        if (!response.uri) {
            return;
        }

        const data = await services.mrnScanerService(cursor, response.uri);

        if (data.status === 'Failure') {
            Alert.alert(
                'Error at image recognition',
                'We cant recognize patient\'s data, please try one more time');
        } else {
            setupData(data.data);
        }
    }

    return (
        <Button
            onPress={() => ImagePicker.launchCamera({}, onResponse)}
            title="Scan mrn label"
        />
    );
}

ScanMrnButton.propTypes = {
    cursor: BaobabPropTypes.cursor.isRequired,
    setupData: React.PropTypes.func.isRequired,
};

ScanMrnButton.contextTypes = {
    services: React.PropTypes.shape({
        mrnScanerService: React.PropTypes.func.isRequired,
    }),
};
