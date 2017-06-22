import React from 'react';
import {
    View,
    Text,
} from 'react-native';
import s from './styles';

const Prediction = React.createClass({
    displayName: 'Prediction',

    propTypes: {
        prediction: React.PropTypes.string,
        predictionAccuracy: React.PropTypes.string,
    },

    render() {
        const { prediction, predictionAccuracy } = this.props;

        return (
            <View style={s.prediction}>
                <View style={{ marginBottom: 10 }}>
                    <Text style={s.text}>
                        <Text style={s.title}>Prediction Accuracy: </Text>
                        {predictionAccuracy}
                    </Text>
                </View>
                <View>
                    <Text style={s.text}>
                        <Text style={s.title}>Prediction: </Text>
                        {prediction}
                    </Text>
                </View>
            </View>
        );
    },
});

export default Prediction;
