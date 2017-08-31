import React from 'react';
import _ from 'lodash';
import schema from 'libs/state';
import {
    View,
    Image,
    Dimensions,
    ActivityIndicator,
    TouchableWithoutFeedback,
} from 'react-native';
import BaobabPropTypes from 'baobab-prop-types';
import ImagePicker from 'react-native-image-picker';
import { Button } from 'components';
import { convertMoleToSave, convertMoleToDisplay } from 'libs/misc';
import dotImagePink from 'components/icons/dot/dot.png';
import dotImageYellow from 'components/icons/dot-yellow/dot-yellow.png';
import MolePicker from './components/mole-picker';
import s from './styles';

const model = {
    tree: {
        imageSize: {
            width: 0,
            height: 0,
        },
    },
};

const DistantPhoto = schema(model)(React.createClass({
    displayName: 'DistantPhoto',

    propTypes: {
        currentAnatomicalSite: React.PropTypes.string,
        onContinuePress: React.PropTypes.func.isRequired,
        moleCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        cursors: React.PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
            patientsMoleImages: BaobabPropTypes.cursor.isRequired,
        }),
        services: React.PropTypes.shape({
            addMolePhotoService: React.PropTypes.func.isRequired,
            getMolePhotoService: React.PropTypes.func.isRequired,
            patientsService: React.PropTypes.func.isRequired,
            getPatientMolesService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        return {
            positionX: null,
            positionY: null,
            isLoading: false,
            selectedMole: {},
        };
    },

    async componentWillMount() {
        const { moleCursor } = this.props;
        const patientMolesCursor = this.getPatientMolesCursor();

        patientMolesCursor.on('update', this.onPatientsMolesUpdate);
        moleCursor.on('update', this.onMoleUpdate);
    },

    componentDidMount() {
        const photo = this.props.tree.distantPhoto.fullSize.get();

        this.getImageSize(photo);
    },

    componentWillUnmount() {
        const { moleCursor } = this.props;
        const patientMolesCursor = this.getPatientMolesCursor();

        patientMolesCursor.off('update', this.onPatientsMolesUpdate);
        moleCursor.off('update', this.onMoleUpdate);
    },

    getPatientMolesCursor() {
        const { cursors } = this.context;
        const patientPk = cursors.currentPatientPk.get();
        const patientMolesCursor = cursors.patientsMoles.select(patientPk, 'moles');

        return patientMolesCursor;
    },

    onPatientsMolesUpdate() {
        this.forceUpdate();

        const patientMolesCursor = this.getPatientMolesCursor();
        const patientMoles = patientMolesCursor.get();

        if (patientMoles.status === 'Succeed') {
            this.setState({ positionX: null, positionY: null, isLoading: false });
        }
    },

    onMoleUpdate() {
        const mole = this.props.moleCursor.get();

        if (mole.status === 'Loading') {
            this.setState({ isLoading: true });
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

    onMolePick(positionX, positionY) {
        this.setState({ positionX, positionY, selectedMole: {} });
    },

    getMoles() {
        const patientMolesCursor = this.getPatientMolesCursor();
        const patientMoles = patientMolesCursor.get('data');

        const moles = _.groupBy(patientMoles, (mole) => {
            const anatomicalSitesLength = mole.data.anatomicalSites.length;
            const anatomicalSite = mole.data.anatomicalSites[anatomicalSitesLength - 1];

            return anatomicalSite.pk;
        });

        return moles;
    },

    getPositionToSave() {
        const { positionX, positionY } = this.state;
        const { width, height } = this.props.tree.get('imageSize');

        return convertMoleToSave(positionX, positionY, width, height);
    },

    onContinuePress() {
        const { selectedMole } = this.state;
        const { currentAnatomicalSite } = this.props;
        const { pk } = this.props.tree.get();
        const position = this.getPositionToSave();

        if (!_.isEmpty(selectedMole)) {
            this.addMolePhoto();
        } else {
            this.props.onContinuePress({
                anatomicalSite: currentAnatomicalSite,
                patientAnatomicalSite: pk,
                positionInfo: { ...position },
            });
        }
    },

    addMolePhoto() {
        ImagePicker.launchCamera({}, (response) => {
            if (response.uri) {
                this.onSubmitMolePhoto(response.uri);
            }
        });
    },

    async onSubmitMolePhoto(uri) {
        const { cursors, services } = this.context;
        const molePk = this.state.selectedMole.pk;
        const service = services.addMolePhotoService;
        const patientPk = cursors.currentPatientPk.get();
        const moleCursor = cursors.patientsMoleImages.select(patientPk, 'moles', molePk);
        const imagesCursor = moleCursor.select('data', 'images');

        const pk = -1;
        imagesCursor.select(pk).set({ data: { pk }, status: 'Loading' });

        this.setState({ isLoading: true });

        const result = await service(patientPk, molePk, imagesCursor.select(pk), uri);

        if (result.status === 'Succeed') {
            this.setState({ isLoading: false, selectedMole: {} });
            imagesCursor.unset(pk);
            imagesCursor.select(result.data.pk).set({ data: { ...result.data }, status: 'Loading' });

            await services.patientsService(cursors.patients);
            await services.getPatientMolesService(
                patientPk,
                cursors.patientsMoles.select(patientPk, 'moles')
            );
            await services.getMolePhotoService(
                patientPk,
                molePk,
                result.data.pk,
                imagesCursor.select(result.data.pk)
            );
        }

        if (result.status === 'Failure') {
            this.setState({ isLoading: false, selectedMole: {} });
            imagesCursor.unset(pk);
        }
    },

    onMolePress(data) {
        this.setState({ positionX: null, positionY: null, selectedMole: data });
    },

    getMolePosition(mole) {
        const { width, height } = this.props.tree.get('imageSize');
        const { positionX, positionY } = mole.data.positionInfo;

        return convertMoleToDisplay(positionX, positionY, width, height);
    },

    render() {
        const { distantPhoto, pk } = this.props.tree.get();
        const { width, height } = this.props.tree.get('imageSize');
        const { positionX, positionY, isLoading, selectedMole } = this.state;
        const { currentAnatomicalSite } = this.props;

        const moles = this.getMoles();
        const currentAnatomicalSiteMoles = moles[currentAnatomicalSite] || [];

        return (
            <View style={s.container}>
                <View style={[s.activityIndicator, { zIndex: isLoading ? 2 : 0 }]}>
                    <ActivityIndicator
                        animating
                        size="large"
                        color="#FF1D70"
                    />
                </View>
                <MolePicker
                    onMolePick={this.onMolePick}
                    positionX={positionX}
                    positionY={positionY}
                >
                    <Image
                        source={{ uri: distantPhoto.fullSize }}
                        resizeMode="contain"
                        style={{ width, height }}
                    />
                    {width && height ? _.map(currentAnatomicalSiteMoles, (mole, index) => {
                        const position = this.getMolePosition(mole);
                        const { positionX: left, positionY: top } = position;

                        if (mole.data.patientAnatomicalSite !== pk) {
                            return null;
                        }

                        const isSelected = _.isEqual(mole.data, this.state.selectedMole);

                        return (
                            <View key={index} style={[s.dot, { left, top }]}>
                                <TouchableWithoutFeedback onPress={() => this.onMolePress(mole.data)}>
                                    <Image source={isSelected ? dotImageYellow : dotImagePink} />
                                </TouchableWithoutFeedback>
                            </View>
                        );
                    }) : null}
                </MolePicker>

                <View style={s.footer}>
                    {(positionX && positionY) || !_.isEmpty(selectedMole) ?
                        <Button
                            type="rect"
                            title="Continue to close-up photo"
                            onPress={this.onContinuePress}
                        />
                    : null}
                </View>
            </View>
        );
    },
}));

export function getDistantPhotoRoute(props, context) {
    return {
        component: DistantPhoto,
        title: 'Add Lesion',
        onLeftButtonPress: () => {
            if (props.onBackPress) {
                props.onBackPress();

                return;
            }

            context.mainNavigator.pop();
        },
        navigationBarHidden: false,
        leftButtonIcon: require('components/icons/back/back.png'),
        tintColor: '#FF2D55',
        passProps: props,
    };
}
