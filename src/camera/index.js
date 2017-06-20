import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import schema from 'libs/state';
import { getCreateOrEditPatientRoute } from '../patients/create-or-edit';
import s from './styles';

export const Camera = schema({})(React.createClass({
    propTypes: {
        visibleCursor: BaobabPropTypes.cursor.isRequired,
        patientsList: React.PropTypes.object, // eslint-disable-line
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        patients: BaobabPropTypes.cursor.isRequired,
        services: React.PropTypes.shape({
            createPatientService: React.PropTypes.func.isRequired,
            patientsService: React.PropTypes.func.isRequired,
        }),
    },

    popPatientsList() {
        const { patientsList, visibleCursor } = this.props;
        const currentTabCursor = this.props.tree.currentTab;
        currentTabCursor.set('patients');

        visibleCursor.set(false);
        patientsList.navigator.popToTop();
    },

    goToNewPatientScreen() {
        this.popPatientsList();
        this.context.mainNavigator.push(
            getCreateOrEditPatientRoute({
                title: 'New Patient',
                service: this.context.services.createPatientService,
                tree: this.props.tree.select('patients'),
                onActionComplete: async (pk) => {
                    this.context.mainNavigator.pop();

                    const result = await this.context.services.patientsService(this.context.patients);

                    /*if (result.status === 'Succeed') {
                        this.context.mainNavigator.push(
                            getAnatomicalSiteWidgetRoute({
                                tree: this.context.patients.select('data', pk),
                                onAddingComplete: this.onAddingComplete,
                            }, this.context)
                        );
                    }*/
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

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={s.buttonWrapper}
                                onPress={this.gotToPatientScreen}
                            >
                                <View style={s.button}>
                                    <Text style={[s.text, s.textRed]}>Existing Patient</Text>
                                </View>
                            </TouchableOpacity>
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
