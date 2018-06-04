import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { getDistantPhotoRoute } from './screens/distant-photo';
import s from './styles';

import plusIcon from './images/plus.png';

const DistantPhotos = createReactClass({
    displayName: 'DistantPhotos',

    propTypes: {
        anatomicalSitesCursor: BaobabPropTypes.cursor.isRequired,
        currentAnatomicalSite: PropTypes.string,
        hideMoleOnModel: PropTypes.func.isRequired,
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired, // eslint-disable-line
        cursors: PropTypes.shape({
            doctor: BaobabPropTypes.cursor.isRequired,
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
        }),
        services: PropTypes.shape({
            addAnatomicalSitePhotoService: PropTypes.func.isRequired,
        }),
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentAnatomicalSite !== this.props.currentAnatomicalSite && this.scrollView) {
            this.scrollView.scrollTo({ x: 0, y: 0, animated: false });
        }
    },

    onButtonPress() {
        const { isParticipant } = this.context.cursors.doctor.get();

        if (isParticipant) {
            this.launchAddPhoto(ImagePicker.showImagePicker);
        } else {
            this.launchAddPhoto(ImagePicker.launchCamera);
        }
    },

    launchAddPhoto(launchFunction) {
        launchFunction({}, (response) => {
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
        const distantPhotos = anatomicalSitesCursor.get('data', currentAnatomicalSite) || [];

        if (distantPhotos.length === 0) {
            anatomicalSitesCursor.select('data', currentAnatomicalSite).set([]);
        }

        const distantPhotoCursor = anatomicalSitesCursor.select(
            'data',
            currentAnatomicalSite,
            distantPhotos.length
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
            distantPhotos = anatomicalSites.data[currentAnatomicalSite] || [];
        }

        return (
            <View style={s.container}>
                <ScrollView
                    ref={(ref) => { this.scrollView = ref; }}
                    scrollEventThrottle={200}
                    contentContainerStyle={{ paddingBottom: 60, paddingLeft: 5 }}
                    scrollIndicatorInsets={{ right: 58, bottom: 60 }}
                >
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
                                            this.props.hideMoleOnModel();
                                            mainNavigator.push(
                                            getDistantPhotoRoute({
                                                tree: anatomicalSitesCursor.select(
                                                    'data',
                                                    currentAnatomicalSite,
                                                    index, 'data'
                                                ),
                                                currentAnatomicalSite,
                                                ...this.props,
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
                </ScrollView>
            </View>
        );
    },
});

export default DistantPhotos;
