import React from 'react';
import {
    View,
    Text,
    ScrollView,
} from 'react-native';
import createReactClass from 'create-react-class';
import { Button } from 'components';
import { resetState } from 'libs/tree';

import ccs from '../crypto-config/styles';


export default createReactClass({
    displayName: 'ParticipantDecryptionError',

    render() {
        return (
            <ScrollView style={{ margin: 50 }}>
                <View style={ccs.container}>
                    <Text style={[ccs.title, ccs.group]}>Decryption error</Text>
                    <Text style={ccs.group}>
                        Can't decrypt your profile after keys reset.
                        Please, contact technical support to re-save your profile
                    </Text>
                    <View
                        style={ccs.group}
                    >
                        <Button
                            title="Log out"
                            onPress={resetState}
                        />
                    </View>
                </View>
            </ScrollView>
        );
    },
});
