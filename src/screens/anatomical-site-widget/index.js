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
        },
    };
};

export const AnatomicalSiteWidget = schema(model)(React.createClass({
    displayName: 'AnatomicalSiteWidget',

    propTypes: {
        onAddingComplete: React.PropTypes.func.isRequired,
    },

    contextTypes: {
        cursors: React.PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
        }),
        services: React.PropTypes.shape({
            addMoleService: React.PropTypes.func.isRequired,
            getAnatomicalSitesService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        return {
            selectedMole: {},
            currentAnatomicalSite: '',
        };
    },

    async componentWillMount() {
        this.context.cursors.patientsMoles.on('update', this.onPatientsMolesUpdate);
    },

    componentWillUnmount() {
        this.context.cursors.patientsMoles.off('update', this.onPatientsMolesUpdate);
    },

    onPatientsMolesUpdate() {
        this.forceUpdate();
    },

    onMoleSelected(data) {
        console.log('onMoleSelected', data);

        this.setState({ selectedMole: data });
    },

    onBodyPartSelected(data) {
        console.log('onBodyPartSelected', data);
        const currentAnatomicalSite = data.name === 'none' ? '' : data.name;

        this.setState({ selectedMole: {}, currentAnatomicalSite });
    },

    onMoleAdded(data) {
        console.log('onMoleAdded', data);

        this.setState({ selectedMole: {} });
    },

    onContinuePress(data) {
        const { selectedMole } = this.state;

        ImagePicker.launchCamera({}, (response) => {
            if (response.uri) {
                this.onSubmitMolePhoto(data || selectedMole, response.uri);
            }
        });
    },

    async onSubmitMolePhoto(data, uri) {
        let moleData = {
            ...data,
            uri,
        };

        const service = this.context.services.addMoleService;
        const patientPk = this.context.cursors.currentPatientPk.get();
        const result = await service(patientPk, this.props.tree.mole, moleData);

        if (result.status === 'Succeed') {
            this.props.onAddingComplete();
        }
    },

    render() {
        const { cursors } = this.context;
        const { selectedMole, currentAnatomicalSite } = this.state;
        const currentPatientPk = cursors.currentPatientPk.get();
        const patientData = this.context.cursors.patients.get('data', currentPatientPk, 'data');
        const isMoleLoading = this.props.tree.select('mole', 'status').get() === 'Loading';
        const sex = patientData && patientData.sex === 'f' ? 'female' : 'male';
        const moles = ['a', 'b'];

        return (
            <View style={s.container}>
                <BodyView3D
                    sex={sex}
                    moles={moles}
                    onBodyPartSelected={this.onBodyPartSelected}
                    onMoleAdded={this.onMoleAdded}
                    onMoleSelected={this.onMoleSelected}
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
                        onContinuePress={this.onContinuePress}
                        moleCursor={this.props.tree.select('mole')}
                    />
                : null}
                <View style={s.footer}>
                    {!_.isEmpty(selectedMole) ?
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
