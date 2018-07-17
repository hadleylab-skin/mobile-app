import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import _ from 'lodash';
import {
    View,
    Text,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import {
    Input, Form, Button, Picker, InfoField,
} from 'components';
import { getCreateOrEditPatientRoute } from 'screens/create-or-edit';
import { getEmailScreenRoute } from './screens/email-screen';

import schema from 'libs/state';

import s from './styles';


const model = {
    tree: {
        form: {
            email: '',
            study: null,
        },
        email: 'patient@gmail.com',
        doctor: {},
        studyPicker: {},
    },
};

export const PatientEmail = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        onPatientAdded: PropTypes.func.isRequired,
        studies: PropTypes.array.isRequired,  // eslint-disable-line
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired, // eslint-disable-line
        services: PropTypes.shape({
            createPatientService: PropTypes.func.isRequired,
            getDoctorByEmailService: PropTypes.func.isRequired,
            sendInviteToDoctorService: PropTypes.func.isRequired,
        }),
        cursors: PropTypes.shape({
            doctor: BaobabPropTypes.cursor.isRequired,
        }),
    },

    componentWillMount() {
        this.props.tree.set(model.tree);
        this.props.tree.email.on('update', this.resetResult);
    },

    componentWillUnmount() {
        this.props.tree.email.off('update', this.resetResult);
    },

    resetResult() {
        this.props.tree.doctor.set({});
    },

    async onSubmit() {
        const email = this.props.tree.get('email');

        await this.context.services.getDoctorByEmailService(
            this.props.tree.doctor,
            email
        );
    },

    goToCreatePatientScreen(useStudyAndEmail) {
        const { mainNavigator, services } = this.context;
        let formData = {};
        let selectedStudy = null;

        if (useStudyAndEmail) {
            const { email, study } = this.props.tree.get('form');

            if (!email || !study) {
                return;
            }

            formData = { email, study };
            selectedStudy = _.find(this.props.studies, (item) => item.pk === study);
        }

        mainNavigator.push(
            getCreateOrEditPatientRoute({
                tree: this.props.tree.select('newPatient'),
                title: 'New Patient',
                service: services.createPatientService,
                onActionComplete: this.props.onPatientAdded,
                study: selectedStudy,
                formData,
            }, this.context)
        );
    },

    async inviteDoctorToStudy() {
        const service = this.context.services.sendInviteToDoctorService;
        const formData = this.props.tree.get('form');

        const result = await service(
            this.props.tree.addDoctorToStudyResult, formData
        );

        if (result.status === 'Succeed') {
            this.context.mainNavigator.pop();
        }
    },

    renderButton() {
        const doctor = this.props.tree.get('doctor');
        const study = this.props.tree.form.get('study');

        // Doctor is not founded --> can create new
        if (doctor && doctor.status === 'Succeed' &&
            _.isEmpty(doctor.data)) {
            return (
                <View style={s.buttonWrapper}>
                    <Button
                        title="Continue"
                        disabled={!study}
                        onPress={() => this.goToCreatePatientScreen(true)}
                    />
                </View>
            );
        }

        // Doctor is participant --> can invite him to study
        if (doctor && doctor.status === 'Succeed'
            && doctor.data.isParticipant) {
            return (
                // ADD study list select control and post invite
                <View style={s.buttonWrapper}>
                    <Button
                        title="Invite to study"
                        onPress={this.inviteDoctorToStudy}
                    />
                </View>
            );
        }

        // Doctor data is not empty --> he is coordinator or doctor, can't do anything
        if (doctor && doctor.status === 'Succeed') {
            return (
                <View style={s.labelWrapper}>
                    <Text style={{ color: '#ACB5BE' }}>
                        Email is already used by existing doctor
                    </Text>
                </View>
            );
        }

        return (
            <View style={s.buttonWrapper}>
                <Button
                    title="Search"
                    onPress={this.onSubmit}
                />
            </View>
        );
    },

    render() {
        const emailCursor = this.props.tree.form.email;
        const studyCursor = this.props.tree.form.study;
        const doctorCursor = this.props.tree.doctor;
        const doctor = doctorCursor.get();
        const isLoading = doctor && doctor.status === 'Loading';
        const isPatient = doctor && doctor.status === 'Succeed'
            && (doctor.data.isParticipant || _.isEmpty(doctor.data));

        return (
            <SafeAreaView style={s.container}>
                <View style={s.inner}>
                    {isLoading ?
                        <View style={s.activityIndicator}>
                            <ActivityIndicator
                                animating
                                size="large"
                                color="#FF1D70"
                            />
                        </View>
                    : null}
                    <Form onSubmit={this.onSubmit}>
                        <View style={s.fields}>
                            <InfoField
                                title="Email"
                                text={emailCursor.get()}
                                onPress={() => this.context.mainNavigator.push(
                                    getEmailScreenRoute({
                                        cursor: this.props.tree.select('email'),
                                        text: emailCursor.get(),
                                        onSubmit: () => {
                                            const currentEmail = this.props.tree.get('email');
                                            const formEmail = emailCursor.get();

                                            if (formEmail !== currentEmail) {
                                                emailCursor.set(currentEmail);
                                                doctorCursor.set({});
                                                studyCursor.set(null);
                                            }

                                            this.context.mainNavigator.pop();
                                        },
                                    }, this.context)
                                )}
                            />
                            {isPatient ?
                                <Picker
                                    tree={this.props.tree.studyPicker}
                                    cursor={this.props.tree.form.study}
                                    items={_.map(this.props.studies, ({ pk, title }) => [pk, title])}
                                    title="Study"
                                />
                            : null}
                        </View>
                        {emailCursor.get() ? this.renderButton() : null}
                    </Form>
                </View>
                <View style={s.footer}>
                    <Button
                        type="rect"
                        title="Continue without email"
                        onPress={() => this.goToCreatePatientScreen(false)}
                    />
                </View>
            </SafeAreaView>
        );
    },
}));

export function patientEmailRoute(props, context) {
    return {
        component: PatientEmail,
        leftButtonTitle: 'Cancel',
        onLeftButtonPress: () => context.mainNavigator.pop(),
        title: props.title,
        navigationBarHidden: false,
        tintColor: '#FF2D55',
        passProps: props,
    };
}
