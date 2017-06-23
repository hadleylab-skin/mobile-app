import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    Image,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import schema from 'libs/state';
import { convertMoleToSave } from 'libs/misc';
import { Button } from 'components';
import ImagePicker from 'react-native-image-picker';
import MolePicker from './components/mole-picker';
import s from './styles';

const model = {
    tree: {
        mole: {},
        anatomicalSiteImage: {},
        showMessage: false,
        imageSize: {},
    },
};

export const ZoomedSite = schema(model)(React.createClass({
    displayName: 'ZoomedSite',

    propTypes: {
        source: React.PropTypes.number.isRequired,
        anatomicalSite: React.PropTypes.string.isRequired,
        onAddingComplete: React.PropTypes.func.isRequired,
        onlyChangeAnatomicalSite: React.PropTypes.bool,
        molePk: React.PropTypes.number,
    },

    contextTypes: {
        cursors: React.PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
        }),
        services: React.PropTypes.shape({
            addMoleService: React.PropTypes.func.isRequired,
            updateMoleService: React.PropTypes.func.isRequired,
            addAnatomicalSitePhotoService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        return {
            positionX: null,
            positionY: null,
        };
    },

    componentDidMount() {
        const { anatomicalSiteImage } = this.props.tree.get();

        if (!_.isEmpty(anatomicalSiteImage && anatomicalSiteImage.data)) {
            const photo = anatomicalSiteImage.data.distantPhoto.fullSize;

            this.getImageSize(photo);
        }
    },

    getImageSize(photo) {
        const windowWidth = Dimensions.get('window').width;

        Image.getSize(photo, (photoWidth, photoHeight) => {
            const width = windowWidth;
            const height = (width / photoWidth) * photoHeight;

            this.props.tree.select('imageSize').set({ width, height });
        });
    },

    async onAddDistantPhoto(uri) {
        const data = {
            anatomicalSite: this.props.anatomicalSite,
            uri,
        };

        this.props.tree.anatomicalSiteImage.select('data', 'distantPhoto', 'fullSize').set(uri);
        this.getImageSize(uri);

        const service = this.context.services.addAnatomicalSitePhotoService;
        const patientPk = this.context.cursors.currentPatientPk.get();
        const result = await service(patientPk, this.props.tree.anatomicalSiteImage, data);

        if (result.status === 'Succeed') {
            this.getImageSize(uri);
            this.props.onAddingComplete(true);
        }
    },

    getPositionToSave() {
        const { positionX, positionY } = this.state;
        const { width, height } = this.props.tree.get('imageSize');
        const { anatomicalSiteImage } = this.props.tree.get();
        let position = {
            positionX: parseInt(positionX, 10),
            positionY: parseInt(positionY, 10),
        };

        if (!_.isEmpty(anatomicalSiteImage)) {
            position = convertMoleToSave(positionX, positionY, width, height);
        }

        return position;
    },

    async onSubmitMolePhoto(uri) {
        const position = this.getPositionToSave();
        const data = {
            anatomicalSite: this.props.anatomicalSite,
            ...position,
            uri,
        };

        const service = this.context.services.addMoleService;
        const patientPk = this.context.cursors.currentPatientPk.get();
        const result = await service(patientPk, this.props.tree.mole, data);

        if (result.status === 'Succeed') {
            this.onMoleAddedSuccessfully();
            this.props.onAddingComplete();
        }
    },

    onMoleAddedSuccessfully() {
        this.props.tree.showMessage.set(true);

        setTimeout(() => this.props.tree.showMessage.set(false), 10000);
    },

    onMolePick(positionX, positionY) {
        this.setState({ positionX, positionY });
    },

    onTakeDisatantPhotoPress() {
        ImagePicker.launchCamera({}, (response) => {
            if (response.uri) {
                this.onAddDistantPhoto(response.uri);
            }
        });
    },

    async onContinuePress() {
        const { onlyChangeAnatomicalSite, onAddingComplete, anatomicalSite, molePk } = this.props;
        const position = this.getPositionToSave();

        if (onlyChangeAnatomicalSite) {
            const patientPk = this.context.cursors.currentPatientPk.get();
            const service = this.context.services.updateMoleService;

            const data = {
                anatomicalSite,
                ...position,
            };

            const result = await service(patientPk, molePk, this.props.tree.mole, data);

            if (result.status === 'Succeed') {
                onAddingComplete();
            }

            return;
        }

        ImagePicker.launchCamera({}, (response) => {
            if (response.uri) {
                this.onSubmitMolePhoto(response.uri);
            }
        });
    },

    render() {
        const { source } = this.props;
        const { anatomicalSiteImage, showMessage } = this.props.tree.get();
        const { positionX, positionY } = this.state;
        const hasMoleLocation = positionX && positionY;
        const isMoleLoading = this.props.tree.select('mole', 'status').get() === 'Loading';

        let width = 0;
        let height = 0;

        let anatomicalSitePhoto;

        if (!_.isEmpty(anatomicalSiteImage && anatomicalSiteImage.data)) {
            anatomicalSitePhoto = anatomicalSiteImage.data.distantPhoto.fullSize;

            if (!_.isEmpty(this.props.tree.get('imageSize'))) {
                width = this.props.tree.get('imageSize', 'width');
                height = this.props.tree.get('imageSize', 'height');
            }
        }

        return (
            <View style={s.container}>
                <View style={[s.wrapper, !anatomicalSitePhoto ? s.defaultWrapper : {}]}>
                    {isMoleLoading ?
                        <View style={s.activityIndicator}>
                            <ActivityIndicator
                                animating
                                size="large"
                                color="#FF1D70"
                            />
                        </View>
                    : null}
                    {showMessage && !hasMoleLocation ?
                        <View style={s.message}>
                            <Text style={s.text}>New mole successfully added</Text>
                        </View>
                    : null}
                    {anatomicalSitePhoto ?
                        <MolePicker
                            onMolePick={this.onMolePick}
                            clearDot={showMessage}
                        >
                            <View>
                                <View style={[s.activityIndicator, { zIndex: 0 }]}>
                                    <ActivityIndicator
                                        animating
                                        size="large"
                                        color="#FF1D70"
                                    />
                                </View>
                                <Image
                                    source={{ uri: anatomicalSitePhoto }}
                                    resizeMode="contain"
                                    style={{ width, height }}
                                />
                            </View>
                        </MolePicker>
                    : (
                        <View style={s.defaultImageWrapper}>
                            <MolePicker
                                onMolePick={this.onMolePick}
                                clearDot={showMessage}
                            >
                                <Image source={source} />
                            </MolePicker>
                        </View>
                    )}
                    <View style={s.footer}>
                        {hasMoleLocation ?
                            <Button
                                disabled={isMoleLoading}
                                type="rect"
                                title="Continue"
                                onPress={this.onContinuePress}
                            />
                        : null }
                        {!hasMoleLocation ?
                            <View style={s.footerInner}>
                                {anatomicalSitePhoto ?
                                    <Text style={s.text}>Tap on location</Text>
                                :
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={s.text}>Tap on location or{' '}</Text>
                                        <TouchableOpacity
                                            style={s.textButton}
                                            onPress={this.onTakeDisatantPhotoPress}
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

export function getZoomedSiteRoute(props) {
    return {
        component: ZoomedSite,
        title: 'Add photo',
        onLeftButtonPress: props.onCancelAddingMole,
        onRightButtonPress: props.onCancelAddingMole,
        navigationBarHidden: false,
        rightButtonTitle: 'Cancel',
        leftButtonIcon: require('components/icons/back/back.png'),
        tintColor: '#FF1D70',
        passProps: props,
    };
}
