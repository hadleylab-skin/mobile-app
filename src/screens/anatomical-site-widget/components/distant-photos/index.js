import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { getDistantPhotoRoute } from './screens/distant-photo';
import s from './styles';

import plusIcon from './images/plus.png';

const DistantPhotos = React.createClass({
    displayName: 'DistantPhotos',

    propTypes: {
        anatomicalSitesCursor: BaobabPropTypes.cursor.isRequired,
        currentAnatomicalSite: React.PropTypes.string,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    onButtonPress() {
        ImagePicker.launchCamera({}, (response) => {
            if (response.uri) {
                console.log('uri', response.uri);
            }
        });
    },

    render() {
        const { anatomicalSitesCursor, currentAnatomicalSite } = this.props;
        const anatomicalSites = anatomicalSitesCursor.get();
        const { mainNavigator } = this.context;
        let distantPhotos = [];

        if (anatomicalSites.data) {
            distantPhotos = anatomicalSites.data[currentAnatomicalSite];
        }

        return (
            <View style={s.container}>
                <TouchableOpacity onPress={this.onButtonPress}>
                    <View style={s.button}>
                        <Image source={plusIcon} />
                        <Text style={s.buttonText}>Distant photo</Text>
                    </View>
                </TouchableOpacity>
                {_.map(distantPhotos, (photo, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => mainNavigator.push(
                            getDistantPhotoRoute({
                                tree: anatomicalSitesCursor.select('data', currentAnatomicalSite, index, 'data'),
                            }, this.context)
                        )}
                    >
                        <Image
                            source={{ uri: photo.data.distantPhoto.thumbnail }}
                            resizeMode="cover"
                            style={s.photo}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    },
});

export default DistantPhotos;
