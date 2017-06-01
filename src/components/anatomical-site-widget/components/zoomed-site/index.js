import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    Image,
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import schema from 'libs/state';
import { Button } from 'components/new/button';
import MolePicker from '../mole-picker';
import s from './styles';

const ZoomedSite = schema({})(React.createClass({
    displayName: 'ZoomedSite',

    propTypes: {
        molesCursor: BaobabPropTypes.cursor.isRequired,
        source: React.PropTypes.number.isRequired,
        label: React.PropTypes.string.isRequired,
    },

    getInitialState() {
        return {
            locationX: null,
            locationY: null,
        };
    },

    onContinuePress() {
        const { locationX, locationY } = this.state;

        this.props.molesCursor.push({
            label: this.props.label,
            locationX,
            locationY,
        });
    },

    onMolePick(locationX, locationY) {
        this.setState({ locationX, locationY });
    },

    render() {
        const { source } = this.props;
        const { locationX, locationY } = this.state;

        return (
            <View style={s.container}>
                <View style={s.wrapper}>
                    <MolePicker onMolePick={this.onMolePick}>
                        <Image source={source} />
                    </MolePicker>
                    <View style={s.footer}>
                        {locationX && locationY ?
                            <Button type="rect" title="Continue" onPress={this.onContinuePress} />
                        :
                            <View style={s.footerInner}>
                                <Text style={s.text}>Tap on location or {' '}</Text>
                                <TouchableOpacity style={s.textButton}>
                                    <Text style={[s.text, s.textPink]}>take a distant photo</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
                </View>
            </View>
        );
    },
}));

export default ZoomedSite;
