import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    ScrollView,
} from 'react-native';
import Gallery from './components/gallery';
import s from './styles';

const Mole = React.createClass({
    displayName: 'Mole',

    propTypes: {},

    contextTypes: {},

    render() {
        return (
            <View style={s.container}>
                <ScrollView scrollEventThrottle={200}>
                    <Gallery />
                </ScrollView>
            </View>
        );
    },
});

export default Mole;
