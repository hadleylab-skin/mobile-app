import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import _ from 'lodash';
import {
    View,
    Text,
    ActivityIndicator,
} from 'react-native';
import {
    Input, Form, Button, Picker,
} from 'components';
import { getCreateOrEditPatientRoute } from 'screens/create-or-edit';

import schema from 'libs/state';

import s from './styles';


const model = {
    email: '',
    study: null,
    doctor: {},
    studyPicker: {},
};

export const PatientEmail = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        onPatientAdded: PropTypes.func.isRequired,
        studiesCursor: BaobabPropTypes.cursor.isRequired,
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

    goToCreatePatientScreen() {
        const { mainNavigator, services } = this.context;
        const email = this.props.tree.get('email');
        const study = this.props.tree.get('study');

        if (!email || !study) {
            return;
        }

        const selectedStudy = _.find(
            this.props.studiesCursor.get('data'),
            (item) => item.pk === study);

        const formData = { email, study };

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

        const result = await service(
            this.props.tree.addDoctorToStudyResult,
            {
                email: this.props.tree.get('email'),
                study: this.props.tree.get('study'),
            }
        );

        if (result.status === 'Succeed') {
            this.context.mainNavigator.pop();
        }
    },

    renderButton() {
        const doctor = this.props.tree.get('doctor');

        // Doctor is not founded --> can create new
        if (doctor && doctor.status === 'Succeed' &&
            _.isEmpty(doctor.data)) {
            return (
                <View style={s.buttonWrapper}>
                    <Button
                        title="Continue"
                        onPress={this.goToCreatePatientScreen}
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
                        title={'Invite to study'}
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
                    title={'Search'}
                    onPress={this.onSubmit}
                />
            </View>
        );
    },

    render() {
        const email = this.props.tree.get('email');
        const studies = this.props.studiesCursor.get();
        const doctor = this.props.tree.get('doctor');
        const isLoading = (studies && studies.status === 'Loading')
            || (doctor && doctor.status === 'Loading');
        const isPatient = doctor && doctor.status === 'Succeed'
            && (doctor.data.isParticipant || _.isEmpty(doctor.data));

        return (
            <View style={s.container}>
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
                        <Input
                            label={'Email'}
                            cursor={this.props.tree.email}
                            autoCapitalize="none"
                            returnKeyType="next"
                            inputWrapperStyle={s.hasBottomBorder}
                            errorWrapperStyle={s.errorEmail}
                            inputStyle={[s.input, s.inputEmail]}
                            placeholderTextColor="#ACB5BE"
                            errorPlaceholderTextColor="#FC3159"
                            name="email"
                        />
                        {isPatient ?
                            <Picker
                                tree={this.props.tree.studyPicker}
                                cursor={this.props.tree.study}
                                items={_.map(studies.data, ({ pk, title }) => [pk, title])}
                                title="Study"
                            />
                        : null}
                        {email ? this.renderButton() : null}
                    </Form>
                </View>
                <View style={s.footer}>
                    <Button
                        type="rect"
                        title="Continue without email"
                        onPress={this.goToCreatePatientScreen}
                    />
                </View>
            </View>
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
