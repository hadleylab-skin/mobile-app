import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Modal,
    Animated,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import schema from 'libs/state';
import { getAnatomicalSiteWidgetRoute } from 'screens/anatomical-site-widget';
import { getCreateOrEditPatientRoute } from 'screens/create-or-edit';
import s from './styles';

export const CameraMenu = schema({})(React.createClass({
    propTypes: {
        visibleCursor: BaobabPropTypes.cursor.isRequired,
        patientsList: React.PropTypes.object, // eslint-disable-line
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        cursors: React.PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
            filter: React.PropTypes.object.isRequired, // eslint-disable-line,
        }),
        services: React.PropTypes.shape({
            createPatientService: React.PropTypes.func.isRequired,
            patientsService: React.PropTypes.func.isRequired,
            getPatientMolesService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        return {
            isBgVisible: false,
            fadeAnim: new Animated.Value(0),
        };
    },

    componentWillMount() {
        this.props.visibleCursor.on('update', this.animateBg);
    },

    componentWillUnmount() {
        this.props.visibleCursor.off('update', this.animateBg);
    },

    animateBg() {
        if (this.props.visibleCursor.get()) {
            this.fadeIn();

            return;
        }

        this.fadeOut();
    },

    popPatientsList() {
        const { patientsList, visibleCursor } = this.props;
        const currentTabCursor = this.props.tree.currentTab;
        currentTabCursor.set('patients');

        visibleCursor.set(false);
        patientsList.navigator.popToTop();
    },

    async onAddingComplete() {
        const { cursors, services } = this.context;
        const patientPk = cursors.currentPatientPk.get();
        const queryParams = cursors.filter.get();

        await services.patientsService(cursors.patients, queryParams);
        await services.getPatientMolesService(
            patientPk,
            cursors.patientsMoles.select(patientPk, 'moles')
        );
    },

    goToNewPatientScreen() {
        const { cursors, services, mainNavigator } = this.context;

        this.popPatientsList();
        mainNavigator.push(
            getCreateOrEditPatientRoute({
                tree: this.props.tree.select('patients', 'newPatient'),
                title: 'New Patient',
                service: services.createPatientService,
                onActionComplete: async (pk) => {
                    const queryParams = cursors.filter.get();

                    cursors.currentPatientPk.set(pk);
                    mainNavigator.push(
                        getAnatomicalSiteWidgetRoute({
                            tree: cursors.patientsMoles.select('data', pk, 'widgetData'),
                            onAddingComplete: this.onAddingComplete,
                            onBackPress: () => mainNavigator.popToTop(),
                        }, this.context)
                    );

                    await services.patientsService(cursors.patients, queryParams);
                },
            }, this.context)
        );
    },

    gotToPatientScreen() {
        this.popPatientsList();
        this.props.tree.patients.select('goToWidget').set(true);
    },

    fadeIn() {
        this.setState({ isBgVisible: true });

        Animated.timing(
            this.state.fadeAnim,
            {
                toValue: 1,
                duration: 150,
            },
        ).start();
    },

    fadeOut() {
        Animated.timing(
            this.state.fadeAnim,
            {
                toValue: 0,
                duration: 150,
            },
        ).start();

        setTimeout(() => this.setState({ isBgVisible: false }), 150);
    },

    render() {
        const { visibleCursor } = this.props;
        const patients = this.context.cursors.patients.get();
        const isPatientsListEmpty = _.isEmpty(patients) || _.isEmpty(patients.data);

        return (
            <View style={this.state.isBgVisible ? s.wrapper : {}}>
                <Animated.View
                    style={[s.wrapperBg, {
                        opacity: this.state.fadeAnim,
                    }]}
                />
                <Modal
                    animationType="slide"
                    transparent
                    visible={visibleCursor.get()}
                >
                    <View style={s.container}>
                        <TouchableWithoutFeedback onPress={() => visibleCursor.set(false)}>
                            <View style={s.bg} />
                        </TouchableWithoutFeedback>
                        <View style={s.buttons}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={s.buttonWrapper}
                                onPress={this.goToNewPatientScreen}
                            >
                                <View style={[s.button, s.hasBottomBorder]}>
                                    <Text style={[s.text, s.textRed]}>New Patient</Text>
                                </View>
                            </TouchableOpacity>
                            {!isPatientsListEmpty ?
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={s.buttonWrapper}
                                    onPress={this.gotToPatientScreen}
                                >
                                    <View style={s.button}>
                                        <Text style={[s.text, s.textRed]}>Existing Patient</Text>
                                    </View>
                                </TouchableOpacity>
                            : null}
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={s.buttonWrapper}
                            onPress={() => visibleCursor.set(false)}
                        >
                            <View style={[s.button, s.buttonCancel]}>
                                <Text style={s.text}>Cancel</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </View>
        );
    },
}));
