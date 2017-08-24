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
import DistantPhoto from './components/distant-photo';
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

    onMoleSelected(data) {
        console.log('onMoleSelected', data);

        this.setState({ selectedMole: data, currentAnatomicalSite: data.anatomicalSite });
    },

    onBodyPartSelected(data) {
        console.log('onBodyPartSelected', data);

        this.setState({ selectedMole: {} });
    },

    onMoleAdded(data) {
        console.log('onMoleAdded', data);

        this.setState({ selectedMole: {}, currentAnatomicalSite: data.anatomicalSite });
    },

    onContinuePress() {
        const { selectedMole } = this.state;

        ImagePicker.launchCamera({}, (response) => {
            if (response.uri) {
                this.onSubmitMolePhoto(selectedMole, response.uri);
            }
        });
    },

    async onSubmitMolePhoto(data, uri) {
        const moleData = {
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
                <DistantPhoto
                    anatomicalSites={this.props.tree.anatomicalSites.get()}
                    currentAnatomicalSite={_.kebabCase(currentAnatomicalSite)}
                />
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
