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
            isLoading: false,
        };
    },

    async onAddDistantPhoto(uri) {
        const data = {
            anatomicalSite: this.props.anatomicalSite,
            uri,
        };

        this.setState({ photo: uri })

        const service = this.context.services.addAnatomicalSitePhotoService;
        const patientPk = this.context.currentPatientPk.get();
        await service(patientPk, this.props.tree.anatomicalSiteImage, data);
    },

    onContinuePress() {
        ImagePicker.launchCamera({}, (response) => this.onSubmitMolePhoto(response.uri));
    },

    async onSubmitMolePhoto(uri) {
        const { positionX, positionY } = this.state;

        const data = {
            anatomicalSite: this.props.anatomicalSite,
            positionX: parseInt(positionX, 10),
            positionY: parseInt(positionY, 10),
            uri,
        };

        this.setState({ isLoading: true });

        const service = this.context.services.addMoleService;
        const patientPk = this.context.currentPatientPk.get();
        const result = await service(patientPk, this.props.tree.mole, data);

        if (result.status === 'Succeed') {
            this.props.onAddingComplete();
            this.setState({ isLoading: false });
        }
    },

    onMolePick(positionX, positionY) {
        this.setState({ positionX, positionY });
    },

    render() {
        const { source } = this.props;
        const anatomicalSiteImage = this.props.tree.get('anatomicalSiteImage');
        const { positionX, positionY, photo, isLoading } = this.state;
        const hasMoleLocation = positionX && positionY;

        let anatomicalSiteImageSource;

        if (!_.isEmpty(anatomicalSiteImage && anatomicalSiteImage.data)) {
            anatomicalSiteImageSource = anatomicalSiteImage.data.distantPhoto.fullSize;
        }

        return (
            <View style={s.container}>
                <View style={s.wrapper}>
                    {isLoading ?
                        <View style={s.activityIndicator}>
                            <ActivityIndicator
                                animating
                                size="large"
                                color="#FF1D70"
                            />
                        </View>
                    : null}
                    <MolePicker onMolePick={this.onMolePick}>
                        {anatomicalSiteImageSource || photo ?
                            <Image
                                source={{ uri: anatomicalSiteImageSource || photo }}
                                style={s.imageURI}
                            />
                        :
                            <Image source={source} />
                        }
                    </MolePicker>
                    <View style={s.footer}>
                        {hasMoleLocation ?
                            <Button type="rect" title="Continue" onPress={this.onContinuePress} />
                        : null }
                        {!hasMoleLocation ?
                            <View style={s.footerInner}>
                                {anatomicalSiteImageSource ?
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
