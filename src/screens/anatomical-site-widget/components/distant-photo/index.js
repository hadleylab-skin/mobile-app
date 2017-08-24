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
        anatomicalSites: React.PropTypes.object, // eslint-disable-line
        currentAnatomicalSite: React.PropTypes.string,
    },

    onButtonPress() {
        ImagePicker.launchCamera({}, (response) => {
            if (response.uri) {
                console.log('uri', response.uri);
            }
        });
    },

    render() {
        const { anatomicalSites, currentAnatomicalSite } = this.props;
        let distantPhotos = [];

        console.log('currentAnatomicalSite', currentAnatomicalSite);

        if (anatomicalSites.data) {
            distantPhotos = anatomicalSites.data[currentAnatomicalSite];
        }

        console.log('distantPhotos', distantPhotos);

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
                        source={{ uri: photo.data.distantPhoto.thumbnail }}
                        resizeMode="cover"
                        style={s.photo}
                    />
                ))}
            </View>
        );
    },
});

export default DistantPhoto;
