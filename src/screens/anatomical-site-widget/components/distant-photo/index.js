import React from 'react';
import _ from 'lodash';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import schema from 'libs/state';
import s from './styles';

import plusIcon from './images/plus.png';

const DistantPhoto = schema({})(React.createClass({
    displayName: 'DistantPhoto',

    onButtonPress() {
        ImagePicker.launchCamera({}, (response) => {
            if (response.uri) {
                this.props.tree.push(response.uri);
            }
        });
    },

    render() {
        const photos = this.props.tree.get();

        return (
            <View style={s.container}>
                <TouchableOpacity onPress={this.onButtonPress}>
                    <View style={s.button}>
                        <Image source={plusIcon} />
                        <Text style={s.buttonText}>Distant photo</Text>
                    </View>
                </TouchableOpacity>
                {_.map(photos, (photo, index) => (
                    <Image
                        key={index}
                        source={{ uri: photo }}
                        resizeMode="cover"
                        style={s.photo}
                    />
                ))}
            </View>
        );
    },
}));

export default DistantPhoto;
