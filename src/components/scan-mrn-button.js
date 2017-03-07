import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import { Alert, StyleSheet, View } from 'react-native';
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
        <View style={{ alignItems: 'center' }}>
            <Button
                onPress={() => ImagePicker.launchCamera({}, onResponse)}
                title="Scan mrn label"
                stylesButton={styles.button}
                stylesText={styles.text}
                underlayColor="rgba(255, 57, 82, 0.7)"
            />
        </View>
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

const styles = StyleSheet.create({
    button: {
        height: 36,
        width: 180,
        borderWidth: 1,
        borderColor: '#FF2D55',
        backgroundColor: '#FF2D55',
        borderRadius: 20,
        marginTop: 30,
        padding: 8,
    },
    text: {
        fontSize: 18,
    },
});
