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
import ImagePicker from 'react-native-image-picker';
import MolePicker from '../mole-picker';
import s from './styles';

const ZoomedSite = schema({})(React.createClass({
    displayName: 'ZoomedSite',

    propTypes: {
        molesCursor: BaobabPropTypes.cursor.isRequired,
        source: React.PropTypes.number.isRequired,
        label: React.PropTypes.string.isRequired,
        onAddingComplete: React.PropTypes.func.isRequired,
    },

    getInitialState() {
        return {
            locationX: null,
            locationY: null,
            userSiteImage: null,
        };
    },

    onAddDistantPhoto(userSiteImage) {
        this.setState({ userSiteImage });
    },

    onContinuePress() {
        const { locationX, locationY } = this.state;

        this.props.molesCursor.push({
            label: this.props.label,
            locationX,
            locationY,
        });

        ImagePicker.launchCamera({}, (response) => this.onSubmitMolePhoto(response.uri));
    },

    onSubmitMolePhoto(uri) {
        this.props.onAddingComplete();
    },

    onMolePick(locationX, locationY) {
        this.setState({ locationX, locationY });
    },

    render() {
        const { source } = this.props;
        const { locationX, locationY, userSiteImage } = this.state;
        const hasMoleLocation = locationX && locationY;

        return (
            <View style={s.container}>
                <View style={s.wrapper}>
                    <MolePicker onMolePick={this.onMolePick}>
                        <Image
                            source={userSiteImage ? { uri: userSiteImage } : source}
                            style={userSiteImage ? s.imageURI : {}}
                        />
                    </MolePicker>
                    <View style={s.footer}>
                        {hasMoleLocation ?
                            <Button type="rect" title="Continue" onPress={this.onContinuePress} />
                        : null }
                        {!hasMoleLocation ?
                            <View style={s.footerInner}>
                                {userSiteImage ?
                                    <Text style={s.text}>Tap on location</Text>
                                :
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={s.text}>Tap on location or{' '}</Text>
                                        <TouchableOpacity
                                            style={s.textButton}
                                            onPress={() => ImagePicker.launchCamera({},
                                                (response) => this.onAddDistantPhoto(response.uri))}
                                        >
                                            <Text style={[s.text, s.textPink]}>take a distant photo</Text>
                                        </TouchableOpacity>
                                    </View>
                                }
                            </View>
                        : null}
                    </View>
                </View>
            </View>
        );
    },
}));

export default ZoomedSite;
