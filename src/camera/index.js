import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import schema from 'libs/state';
import { getAnatomicalSiteWidgetRoute } from 'components/anatomical-site-widget';
import { getCreateOrEditPatientRoute } from '../patients/create-or-edit';
import s from './styles';

export const Camera = schema({})(React.createClass({
    propTypes: {
        visibleCursor: BaobabPropTypes.cursor.isRequired,
        patientsList: React.PropTypes.object, // eslint-disable-line
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        currentPatientPk: BaobabPropTypes.cursor.isRequired,
        patients: BaobabPropTypes.cursor.isRequired,
        patientsMoles: BaobabPropTypes.cursor.isRequired,
        services: React.PropTypes.shape({
            createPatientService: React.PropTypes.func.isRequired,
            patientsService: React.PropTypes.func.isRequired,
            getPatientMolesService: React.PropTypes.func.isRequired,
        }),
    },

    popPatientsList() {
        const { patientsList, visibleCursor } = this.props;
        const currentTabCursor = this.props.tree.currentTab;
        currentTabCursor.set('patients');

        visibleCursor.set(false);
        patientsList.navigator.popToTop();
    },

    async onAddingComplete() {
        const patientPk = this.context.currentPatientPk.get();

        await this.context.services.patientsService(this.context.patients);
        await this.context.services.getPatientMolesService(
            patientPk,
            this.context.patientsMoles.select(patientPk, 'moles')
        );
    },

    goToNewPatientScreen() {
        this.popPatientsList();
        this.context.mainNavigator.push(
            getCreateOrEditPatientRoute({
                title: 'New Patient',
                service: this.context.services.createPatientService,
                tree: this.props.tree.select('patients', 'newPatient'),
                onActionComplete: async (pk) => {
                    this.context.currentPatientPk.set(pk);
                    this.context.mainNavigator.push(
                        getAnatomicalSiteWidgetRoute({
                            tree: this.context.patientsMoles.select('data', pk),
                            onAddingComplete: this.onAddingComplete,
                            onBackPress: () => this.context.mainNavigator.popToTop(),
                        }, this.context)
                    );

                    await this.context.services.patientsService(this.context.patients);
                },
            }, this.context)
        );
    },

    gotToPatientScreen() {
        this.popPatientsList();
        this.props.tree.patients.select('goToWidget').set(true);
    },

    render() {
        const { visibleCursor } = this.props;
        const patients = this.context.patients.get();
        const isPatientsListEmpty = _.isEmpty(patients) || _.isEmpty(patients.data);

        return (
            <View>
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
