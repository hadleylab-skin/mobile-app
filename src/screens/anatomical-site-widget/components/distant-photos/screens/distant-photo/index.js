import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
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

const DistantPhoto = schema(model)(createReactClass({
    displayName: 'DistantPhoto',

    propTypes: {
        currentAnatomicalSite: PropTypes.string,
        moleCursor: BaobabPropTypes.cursor.isRequired,
        selectedMoleCursor: BaobabPropTypes.cursor.isRequired,
        onContinuePress: PropTypes.func.isRequired,
    },

    contextTypes: {
        cursors: PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
        }),
    },

    getInitialState() {
        return {
            positionX: null,
            positionY: null,
        };
    },

    componentWillMount() {
        const patientMolesCursor = this.getPatientMolesCursor();

        patientMolesCursor.on('update', this.onPatientsMolesUpdate);
    },

    componentDidMount() {
        const photo = this.props.tree.distantPhoto.fullSize.get();

        this.getImageSize(photo);
    },

    componentWillUnmount() {
        const patientMolesCursor = this.getPatientMolesCursor();

        patientMolesCursor.off('update', this.onPatientsMolesUpdate);
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
            this.setState({ positionX: null, positionY: null });
        }
    },

    getImageSize(photo) {
        const windowHeight = Dimensions.get('window').height;
        const paddingTop = 64;

        Image.getSize(photo, (photoWidth, photoHeight) => {
            const height = windowHeight - paddingTop;
            const width = (height / photoHeight) * photoWidth;

            this.props.tree.select('imageSize').set({ width, height });
        });
    },

    onMolePick(positionX, positionY) {
        this.setState({ positionX, positionY });
        const { currentAnatomicalSite } = this.props;
        const position = this.getPositionToSave(positionX, positionY);

        this.props.selectedMoleCursor.data.set({
            anatomicalSite: currentAnatomicalSite,
            patientAnatomicalSite: this.props.tree.get('pk'),
            positionInfo: { ...position },
        });
    },

    getPositionToSave(positionX, positionY) {
        const { width, height } = this.props.tree.get('imageSize');

        return convertMoleToSave(positionX, positionY, width, height);
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

    onExistingMolePress(data) {
        this.setState({ positionX: null, positionY: null });
        this.props.selectedMoleCursor.data.set({
            pk: data.pk,
        });
    },

    getExistingMolePosition(mole) {
        const { width, height } = this.props.tree.get('imageSize');
        const { positionX, positionY } = mole.data.positionInfo;

        return convertMoleToDisplay(positionX, positionY, width, height);
    },

    render() {
        const windowWidth = Dimensions.get('window').width;
        const { distantPhoto, pk } = this.props.tree.get();
        const { width, height } = this.props.tree.get('imageSize');
        const { positionX, positionY } = this.state;
        const { currentAnatomicalSite, moleCursor } = this.props;
        const selectedMole = this.props.selectedMoleCursor.get();

        const isMoleLoading = selectedMole.status === 'Loading' ||
            moleCursor.get('status') === 'Loading';

        const moles = this.getMoles();
        const currentAnatomicalSiteMoles = moles[currentAnatomicalSite] || [];

        return (
            <View style={s.container}>
                <View style={[s.activityIndicator, { zIndex: isMoleLoading ? 2 : 0 }]}>
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
                    style={{ width, height, marginLeft: ((width - windowWidth) / 2) * -1 }}
                >
                    <Image
                        source={{ uri: distantPhoto.fullSize }}
                        style={{ width, height }}
                    />
                    {width && height ? _.map(currentAnatomicalSiteMoles, (mole, index) => {
                        const position = this.getExistingMolePosition(mole);
                        const { positionX: left, positionY: top } = position;

                        if (mole.data.patientAnatomicalSite !== pk) {
                            return null;
                        }

                        const isSelected = _.isEqual(mole.data.pk, selectedMole.data.pk);

                        return (
                            <View key={index} style={[s.dot, { left, top }]}>
                                <TouchableWithoutFeedback onPress={() => this.onExistingMolePress(mole.data)}>
                                    <Image source={isSelected ? dotImageYellow : dotImagePink} />
                                </TouchableWithoutFeedback>
                            </View>
                        );
                    }) : null}
                </MolePicker>

                <View style={s.footer}>
                    {!_.isEmpty(selectedMole.data) ?
                        <Button
                            type="rect"
                            title="Continue to close-up photo"
                            onPress={this.props.onContinuePress}
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
            props.showMoleOnModel();
            props.resetSelectedMole();
            context.mainNavigator.pop();
        },
        navigationBarHidden: false,
        leftButtonIcon: require('components/icons/back/back.png'),
        tintColor: '#FF2D55',
        passProps: props,
    };
}
