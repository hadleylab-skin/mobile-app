import React from 'react';
import _ from 'lodash';
import {
    View,
    ActivityIndicator,
} from 'react-native';
import { BodyView3D, Button } from 'components';
import ImagePicker from 'react-native-image-picker';
import BaobabPropTypes from 'baobab-prop-types';
import schema from 'libs/state';
import DistantPhotos from './components/distant-photos';
import s from './styles';

const model = (props, context) => {
    const patientPk = context.cursors.currentPatientPk.get();

    return {
        tree: {
            anatomicalSites: (cursor) => context.services.getAnatomicalSitesService(patientPk, cursor),
            mole: {},
            selectedMole: {},
        },
    };
};

export const AnatomicalSiteWidget = schema(model)(React.createClass({
    displayName: 'AnatomicalSiteWidget',

    propTypes: {
        onAddingComplete: React.PropTypes.func.isRequired,
        sex: React.PropTypes.string,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        cursors: React.PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
            patientsMoleImages: BaobabPropTypes.cursor.isRequired,
        }),
        services: React.PropTypes.shape({
            addMoleService: React.PropTypes.func.isRequired,
            getAnatomicalSitesService: React.PropTypes.func.isRequired,
            addMolePhotoService: React.PropTypes.func.isRequired,
            getMolePhotoService: React.PropTypes.func.isRequired,
            patientsService: React.PropTypes.func.isRequired,
            getPatientMolesService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        return {
            currentAnatomicalSite: '',
            isNewMoleRemoved: false,
        };
    },

    componentWillMount() {
        this.resetSelectedMole();
        this.context.cursors.patientsMoles.on('update', this.onPatientsMolesUpdate);
    },

    componentWillUnmount() {
        this.context.cursors.patientsMoles.off('update', this.onPatientsMolesUpdate);
    },

    onPatientsMolesUpdate() {
        this.forceUpdate();
    },

    onMoleSelected(data) {
        const patientMolesCursor = this.getPatientMolesCursor();
        const patientMoles = patientMolesCursor.get('data');
        const mole = _.find(patientMoles, { data: { positionInfo: { id: data.id } } });

        this.props.tree.selectedMole.data.set({
            pk: mole.data.pk,
        });
    },

    onBodyPartSelected(data) {
        const currentAnatomicalSite = data.name === 'Whole Body' ? '' : data.name;

        this.setState({ currentAnatomicalSite });
        this.resetSelectedMole();
    },

    onMoleAdded(data) {
        this.props.tree.selectedMole.data.set({
            anatomicalSite: data.anatomicalSite,
            patientAnatomicalSite: null,
            positionInfo: data,
        });
    },

    onContinuePress() {
        const selectedMole = this.props.tree.get('selectedMole', 'data');

        ImagePicker.launchCamera({}, (response) => {
            if (response.uri) {
                if (selectedMole.pk) {
                    this.onSubmitExistingMolePhoto(response.uri, selectedMole.pk);
                } else {
                    this.onSubmitNewMole(selectedMole, response.uri);
                }
            }
        });
    },

    resetSelectedMole() {
        this.props.tree.selectedMole.set({
            data: {},
            status: 'Succeed',
        });
    },

    async onSubmitNewMole(data, uri) {
        const selectedMoleCursor = this.props.tree.selectedMole;
        selectedMoleCursor.status.set('Loading');

        let moleData = {
            ...data,
            uri,
        };

        const service = this.context.services.addMoleService;
        const patientPk = this.context.cursors.currentPatientPk.get();
        const result = await service(patientPk, this.props.tree.mole, moleData);

        if (result.status === 'Succeed') {
            const addingCompleteResult = await this.props.onAddingComplete();

            if (addingCompleteResult.status === 'Succeed') {
                this.resetSelectedMole();
            }
        }
    },

    async onSubmitExistingMolePhoto(uri, molePk) {
        const { cursors, services } = this.context;
        const selectedMoleCursor = this.props.tree.selectedMole;
        const service = services.addMolePhotoService;
        const patientPk = cursors.currentPatientPk.get();
        const moleCursor = cursors.patientsMoleImages.select(patientPk, 'moles', molePk);
        const imagesCursor = moleCursor.select('data', 'images');

        const pk = -1;
        imagesCursor.select(pk).set({ data: { pk }, status: 'Loading' });

        selectedMoleCursor.status.set('Loading');

        const result = await service(patientPk, molePk, imagesCursor.select(pk), uri);

        if (result.status === 'Succeed') {
            imagesCursor.unset(pk);
            imagesCursor.select(result.data.pk).set({ data: { ...result.data }, status: 'Loading' });

            await services.patientsService(cursors.patients);
            await services.getPatientMolesService(
                patientPk,
                cursors.patientsMoles.select(patientPk, 'moles')
            );
            const molesResult = await services.getMolePhotoService(
                patientPk,
                molePk,
                result.data.pk,
                imagesCursor.select(result.data.pk)
            );

            if (molesResult.status === 'Succeed') {
                this.resetSelectedMole();
            }
        }

        if (result.status === 'Failure') {
            selectedMoleCursor.status.set('Failure');
            imagesCursor.unset(pk);
        }
    },

    getPatientMolesCursor() {
        const { cursors } = this.context;
        const patientPk = cursors.currentPatientPk.get();
        const patientMolesCursor = cursors.patientsMoles.select(patientPk, 'moles');

        return patientMolesCursor;
    },

    getMoles() {
        const patientMolesCursor = this.getPatientMolesCursor();
        const patientMoles = patientMolesCursor.get('data');

        const moles =
            _.map(
                _.reject(patientMoles, (mole) => !mole.data || mole.data.patientAnatomicalSite),
                (mole) => mole.data.positionInfo);

        const groupedMoles = _.groupBy(moles, (mole) => _.kebabCase(mole.anatomicalSite));

        return groupedMoles;
    },

    render() {
        const { cursors } = this.context;
        const { currentAnatomicalSite } = this.state;
        const selectedMole = this.props.tree.get('selectedMole');
        const currentPatientPk = cursors.currentPatientPk.get();
        const patientData = this.context.cursors.patients.get('data', currentPatientPk, 'data');
        const isMoleLoading = selectedMole.status === 'Loading' ||
            this.props.tree.get('mole', 'status') === 'Loading';
        const sex = this.props.sex === 'f' || (patientData && patientData.sex === 'f') ? 'female' : 'male';
        const moles = this.getMoles();

        return (
            <View style={s.container}>
                <BodyView3D
                    sex={sex}
                    moles={moles[_.kebabCase(currentAnatomicalSite)] || []}
                    onBodyPartSelected={this.onBodyPartSelected}
                    onMoleAdded={this.onMoleAdded}
                    onMoleSelected={this.onMoleSelected}
                    removeMole={this.state.isNewMoleRemoved}
                />
                {isMoleLoading ?
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating
                            size="large"
                            color="#FF1D70"
                        />
                    </View>
                : null}
                {currentAnatomicalSite ?
                    <DistantPhotos
                        anatomicalSitesCursor={this.props.tree.anatomicalSites}
                        currentAnatomicalSite={_.kebabCase(currentAnatomicalSite)}
                        moleCursor={this.props.tree.select('mole')}
                        selectedMoleCursor={this.props.tree.selectedMole}
                        hideMoleOnModel={() => {
                            this.setState({ isNewMoleRemoved: true });
                            this.resetSelectedMole();
                        }}
                        resetSelectedMole={() => this.props.tree.selectedMole.data.set({})}
                        showMoleOnModel={() => this.setState({ isNewMoleRemoved: false })}
                        onContinuePress={this.onContinuePress}
                    />
                : null}
                <View style={s.footer}>
                    {!_.isEmpty(selectedMole.data) ?
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

export function getAnatomicalSiteWidgetRoute({ title, ...props }, context) {
    return {
        component: AnatomicalSiteWidget,
        title: title || 'Select Location',
        onLeftButtonPress: () => {
            if (props.onBackPress) {
                props.onBackPress();

                return;
            }

            context.mainNavigator.pop();
        },
        onRightButtonPress: () => {
            if (props.onBackPress) {
                props.onBackPress();

                return;
            }

            context.mainNavigator.pop();
        },
        navigationBarHidden: false,
        rightButtonTitle: 'Cancel',
        leftButtonIcon: require('components/icons/back/back.png'),
        tintColor: '#FF2D55',
        passProps: props,
    };
}
