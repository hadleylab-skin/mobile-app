import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    Text,
} from 'react-native';
import s from './styles';

const Prediction = createReactClass({
    displayName: 'Prediction',

    propTypes: {
        prediction: PropTypes.string,
        predictionAccuracy: PropTypes.string,
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
