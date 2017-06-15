import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    Image,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import schema from 'libs/state';
import { Button } from 'components';
import ImagePicker from 'react-native-image-picker';
import MolePicker from '../mole-picker';
import s from './styles';

const model = {
    tree: {
        mole: {},
        anatomicalSiteImage: {},
    },
};

const ZoomedSite = schema(model)(React.createClass({
    displayName: 'ZoomedSite',

    propTypes: {
        source: React.PropTypes.number.isRequired,
        anatomicalSite: React.PropTypes.string.isRequired,
        onAddingComplete: React.PropTypes.func.isRequired,
    },

    contextTypes: {
        currentPatientPk: BaobabPropTypes.cursor.isRequired,
        services: React.PropTypes.shape({
            addMoleService: React.PropTypes.func.isRequired,
            addAnatomicalSitePhotoService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        return {
            positionX: null,
            positionY: null,
            photo: null,
            showMessage: false,
        };
    },

    async onAddDistantPhoto(uri) {
        const data = {
            anatomicalSite: this.props.anatomicalSite,
            uri,
        };

        this.setState({ photo: uri });

        const service = this.context.services.addAnatomicalSitePhotoService;
        const patientPk = this.context.currentPatientPk.get();
        await service(patientPk, this.props.tree.anatomicalSiteImage, data);
    },

    async onSubmitMolePhoto(uri) {
        const { positionX, positionY } = this.state;

        const data = {
            anatomicalSite: this.props.anatomicalSite,
            positionX: parseInt(positionX, 10),
            positionY: parseInt(positionY, 10),
            uri,
        };

        const service = this.context.services.addMoleService;
        const patientPk = this.context.currentPatientPk.get();
        const result = await service(patientPk, this.props.tree.mole, data);

        if (result.status === 'Succeed') {
            this.onMoleAddedSuccessfully();
            this.props.onAddingComplete();
        }
    },

    onMoleAddedSuccessfully() {
        this.setState({ showMessage: true, positionX: null, positionY: null });

        setTimeout(() => this.setState({ showMessage: false }), 10000);
    },

    onMolePick(positionX, positionY) {
        this.setState({ positionX, positionY });
    },

    onTakeDisatantPhotoPress() {
        ImagePicker.launchCamera({}, (response) => this.onAddDistantPhoto(response.uri));
    },

    onContinuePress() {
        ImagePicker.launchCamera({}, (response) => this.onSubmitMolePhoto(response.uri));
    },

    render() {
        const { source } = this.props;
        const anatomicalSiteImage = this.props.tree.get('anatomicalSiteImage');
        const { positionX, positionY, photo, showMessage } = this.state;
        const hasMoleLocation = positionX && positionY;
        const isMoleLoading = this.props.tree.select('mole', 'status').get() === 'Loading';

        let anatomicalSiteImageSource;

        if (!_.isEmpty(anatomicalSiteImage && anatomicalSiteImage.data)) {
            anatomicalSiteImageSource = anatomicalSiteImage.data.distantPhoto.fullSize;
        }


        return (
            <View style={s.container}>
                <View style={s.wrapper}>
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
                    {anatomicalSiteImageSource || photo ?
                        <MolePicker onMolePick={this.onMolePick}>
                            <View>
                                <View style={[s.activityIndicator, { zIndex: 0 }]}>
                                    <ActivityIndicator
                                        animating
                                        size="large"
                                        color="#FF1D70"
                                    />
                                </View>
                                <Image
                                    source={{ uri: anatomicalSiteImageSource || photo }}
                                    style={s.imageURI}
                                />
                            </View>
                        </MolePicker>
                    : (
                        <View style={s.defaultImageWrapper}>
                            <MolePicker onMolePick={this.onMolePick}>
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
                                {anatomicalSiteImageSource || photo ?
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

export default ZoomedSite;
