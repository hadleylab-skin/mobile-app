import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { Alert } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { Button } from 'components';

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
            title="Scan MRN label"
        />
    );
}

ScanMrnButton.propTypes = {
    cursor: BaobabPropTypes.cursor.isRequired,
    setupData: PropTypes.func.isRequired,
};

ScanMrnButton.contextTypes = {
    services: PropTypes.shape({
        mrnScanerService: PropTypes.func.isRequired,
    }),
};
