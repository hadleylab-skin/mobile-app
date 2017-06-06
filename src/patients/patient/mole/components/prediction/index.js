import React from 'react';
import {
    View,
    Text,
} from 'react-native';
import s from './styles';

const Prediction = React.createClass({
    displayName: 'Prediction',

    render() {
        return (
            <View style={s.prediction}>
                <View style={{ marginBottom: 10 }}>
                    <Text style={s.text}>
                        <Text style={s.title}>Prediction Accuracy: </Text>
                        0.890
                    </Text>
                </View>
                <View>
                    <Text style={s.text}>
                        <Text style={s.title}>Prediction: </Text>
                        Seems Benign
                    </Text>
                </View>
            </View>
        );
    },
});

export default Prediction;
