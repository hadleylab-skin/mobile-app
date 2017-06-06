import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    ScrollView,
} from 'react-native';
import schema from 'libs/state';
import { InfoField, Switch } from 'components';
import Gallery from './components/gallery';
import s from './styles';

const model = {
    tree: {
        biopsy: false,
    },
};

const Mole = schema(model)(React.createClass({
    displayName: 'Mole',

    propTypes: {},

    contextTypes: {},

    render() {
        return (
            <View style={s.container}>
                <ScrollView scrollEventThrottle={200}>
                    <Gallery />
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
                    <View style={s.distantPhoto} />
                    <View style={s.fields}>
                        <InfoField title={'Very long field title'} text={'Very long field text text text text text text'} hasNoBorder />
                        <InfoField title={'Site'} text={'Left Ear Helix'} />
                        <InfoField title={'Site'} text={'Left Ear Helix'} />
                        <InfoField title={'Biopsy'}>
                            <Switch
                                cursor={this.props.tree.biopsy}
                                items={[
                                    { label: 'Yes', value: true },
                                    { label: 'No', value: false },
                                ]}
                            />
                        </InfoField>
                    </View>
                </ScrollView>
            </View>
        );
    },
}));

export default Mole;
