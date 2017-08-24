import React from 'react';
import _ from 'lodash';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import s from './styles';

import plusIcon from './images/plus.png';

const DistantPhoto = React.createClass({
    displayName: 'DistantPhoto',

    propTypes: {
        onDistantPhotoAdded: React.PropTypes.func.isRequired,
        distantPhotos: React.PropTypes.arrayOf(React.PropTypes.string),
    },

    onButtonPress() {
        ImagePicker.launchCamera({}, (response) => {
            if (response.uri) {
                this.props.onDistantPhotoAdded(response.uri);
            }
        });
    },

    render() {
        const { distantPhotos } = this.props;

        return (
            <View style={s.container}>
                <TouchableOpacity onPress={this.onButtonPress}>
                    <View style={s.button}>
                        <Image source={plusIcon} />
                        <Text style={s.buttonText}>Distant photo</Text>
                    </View>
                </TouchableOpacity>
                {_.map(distantPhotos, (photo, index) => (
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
});

export default DistantPhoto;
