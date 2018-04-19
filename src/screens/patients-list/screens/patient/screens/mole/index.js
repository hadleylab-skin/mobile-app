import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Image,
    Dimensions,
    ScrollView,
} from 'react-native';
import schema from 'libs/state';
import ImagePicker from 'react-native-image-picker';
import { Updater } from 'components';
import Gallery from './components/gallery';
import Prediction from './components/prediction';
import InfoFields from './components/info-fields';
import AnatomicalSite from './components/anatomical-site';
import s from './styles';

export const Mole = schema({})(React.createClass({
    displayName: 'Mole',

    propTypes: {
        molePk: React.PropTypes.number.isRequired,
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
        checkConsent: React.PropTypes.func.isRequired,
        hideBottomPanel: React.PropTypes.bool,
    },

    contextTypes: {
        cursors: React.PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            currentStudyPk: BaobabPropTypes.cursor.isRequired,
            doctor: BaobabPropTypes.cursor.isRequired,
        }),
        services: React.PropTypes.shape({
            getMoleService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        return {
            currentImagePk: null,
            imagesLength: 0,
        };
    },

    async componentWillMount() {
        const patientPk = this.context.cursors.currentPatientPk.get();
        const currentStudyPk = this.context.cursors.currentStudyPk.get();

        const result = await this.context.services.getMoleService(
            patientPk,
            this.props.molePk,
            this.props.tree,
            currentStudyPk,
        );

        if (result.status === 'Succeed') {
            this.getPhotoSize();
        }

        this.props.tree.on('update', this.getPhotoSize);
        this.props.tree.select('data', 'images').on('update', this.update);
    },

    componentWillUnmount() {
        this.props.tree.off('update', this.getPhotoSize);
        this.props.tree.select('data', 'images').off('update', this.update);
    },

    getPhotoSize() {
        const { patientAnatomicalSite } = this.props.tree.data;

        if (!_.isEmpty(patientAnatomicalSite.get())) {
            const photo = patientAnatomicalSite.get('distantPhoto', 'fullSize');
            const windowWidth = Dimensions.get('window').width;

            Image.getSize(photo, (photoWidth, photoHeight) => {
                if (_.isEmpty(patientAnatomicalSite.get())) {
                    return;
                }

                const width = windowWidth;
                const height = (width / photoWidth) * photoHeight;

                patientAnatomicalSite.select('width').set(width);
                patientAnatomicalSite.select('height').set(height);
            });
        }
    },

    update() {
        const images = this.sortImages(this.props.tree.get('data', 'images'));
        const firstImagePk = images[0].data.pk;

        if (!_.isEmpty(this.props.tree.get('data')) && !this.state.currentImagePk) {
            this.setcurrentImagePk(firstImagePk);
        }

        if (!_.isEmpty(this.props.tree.get('data'))) {
            if (this.state.imagesLength && (images.length > this.state.imagesLength)) {
                this.setcurrentImagePk(firstImagePk);
            }

            if (!_.find(images, { data: { pk: this.state.currentImagePk } })) {
                this.setcurrentImagePk(firstImagePk);
            }

            this.setState({ imagesLength: images.length });
        }
    },

    setcurrentImagePk(pk) {
        this.setState({ currentImagePk: pk });
    },

    sortImages(images) {
        return _.reverse(_.sortBy(images, ['data', 'dateCreated']));
    },

    render() {
        const patientPk = this.context.cursors.currentPatientPk.get();
        const currentStudyPk = this.context.cursors.currentStudyPk.get();
        const canSeePrediction = this.context.cursors.doctor.get('canSeePrediction');
        const { currentImagePk } = this.state;
        const { data } = this.props.tree.get();
        const { hideBottomPanel } = this.props;
        let images = !_.isEmpty(data) ? this.sortImages(data.images) : [];

        const currentImage = _.find(images, { data: { pk: currentImagePk } });

        return (
            <Updater
                service={async () => await this.context.services.getMoleService(
                    patientPk,
                    this.props.molePk,
                    this.props.tree,
                    currentStudyPk,
                )}
                style={hideBottomPanel ? s.container : s.containerWithMargin}
            >
                <ScrollView scrollEventThrottle={200}>
                    <View style={s.inner}>
                        <Gallery
                            images={images}
                            currentImagePk={currentImagePk}
                            setcurrentImagePk={this.setcurrentImagePk}
                        />
                        {currentImage && currentImage.data.dateCreated ?
                            <View>
                                {canSeePrediction ?
                                    <Prediction {...currentImage.data} />
                                : null}
                                <AnatomicalSite tree={this.props.tree} checkConsent={this.props.checkConsent} />
                                <InfoFields
                                    tree={this.props.tree.select('data', 'images', currentImagePk, 'data')}
                                    molePk={this.props.molePk}
                                    imagePk={this.props.tree.get('data', 'images', currentImagePk, 'data', 'pk')}
                                    navigator={this.props.navigator}
                                    currentImage={currentImage}
                                />
                            </View>
                        : null}
                    </View>
                </ScrollView>
            </Updater>
        );
    },
}));

export function getMoleRoute(props) {
    const { checkConsent } = props;
    async function onRightButtonPress() {
        let isConsentValid = await checkConsent();
        if (isConsentValid) {
            ImagePicker.launchCamera({},
                (response) => {
                    if (response.uri) {
                        props.onSubmitMolePhoto(response.uri);
                    }
                });
        }
    }
    return {
        component: Mole,
        title: props.title,
        onLeftButtonPress: () => props.navigator.pop(),
        onRightButtonPress,
        navigationBarHidden: false,
        leftButtonIcon: require('components/icons/back/back.png'),
        rightButtonIcon: require('components/icons/camera/camera.png'),
        tintColor: '#FF2D55',
        passProps: props,
    };
}
