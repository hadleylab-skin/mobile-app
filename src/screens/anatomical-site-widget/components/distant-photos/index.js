import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator,
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
        onContinuePress: React.PropTypes.func.isRequired,
        moleCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        cursors: React.PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
        }),
        services: React.PropTypes.shape({
            addAnatomicalSitePhotoService: React.PropTypes.func.isRequired,
        }),
    },

    onButtonPress() {
        ImagePicker.launchCamera({}, (response) => {
            if (response.uri) {
                this.onAddDistantPhoto(response.uri);
            }
        });
    },

    async onAddDistantPhoto(uri) {
        const { cursors, services } = this.context;
        const { currentAnatomicalSite, anatomicalSitesCursor } = this.props;
        const data = {
            anatomicalSite: currentAnatomicalSite,
            uri,
        };

        const service = services.addAnatomicalSitePhotoService;
        const patientPk = cursors.currentPatientPk.get();
        const distantPhotos = anatomicalSitesCursor.get('data', currentAnatomicalSite);

        const distantPhotoCursor = anatomicalSitesCursor.select(
            'data',
            currentAnatomicalSite,
            distantPhotos ? distantPhotos.length : 0
        );

        distantPhotoCursor.set({ data: {} });
        await service(patientPk, distantPhotoCursor, data);
    },

    render() {
        const { anatomicalSitesCursor, currentAnatomicalSite } = this.props;
        const anatomicalSites = anatomicalSitesCursor.get();
        const { mainNavigator } = this.context;
        let distantPhotos = [];

        if (anatomicalSites.data) {
            distantPhotos = _.sortBy(anatomicalSites.data[currentAnatomicalSite], (item) => item.data.pk);
        }

        return (
            <View style={s.container}>
                <TouchableOpacity onPress={this.onButtonPress}>
                    <View style={s.button}>
                        <Image source={plusIcon} />
                        <Text style={s.buttonText}>Distant photo</Text>
                    </View>
                </TouchableOpacity>
                {_.map(distantPhotos, (photo, index) => {
                    const hasPhoto = photo.data && photo.data.distantPhoto;

                    return (
                        <View style={{ marginTop: 5 }} key={index}>
                            <TouchableOpacity
                                onPress={() => {
                                    if (hasPhoto) {
                                        mainNavigator.push(
                                        getDistantPhotoRoute({
                                            tree: anatomicalSitesCursor.select(
                                                'data',
                                                currentAnatomicalSite,
                                                index, 'data'
                                            ),
                                            currentAnatomicalSite,
                                            onContinuePress: this.props.onContinuePress,
                                            moleCursor: this.props.moleCursor,
                                        }, this.context));
                                    }
                                }}
                                activeOpacity={hasPhoto ? 0.2 : 1}
                                style={s.photoWrapper}
                            >
                                {hasPhoto ?
                                    <Image
                                        source={{ uri: photo.data.distantPhoto.thumbnail }}
                                        resizeMode="cover"
                                        style={s.photo}
                                    />
                                : null}
                                <View style={s.activityIndicator}>
                                    <ActivityIndicator animating color="#FF1D70" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        );
    },
});

export default DistantPhotos;
