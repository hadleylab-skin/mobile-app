import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import _ from 'lodash';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import {
    Input, Form, Button, Updater, Picker,
} from 'components';
import { getCreateOrEditPatientRoute } from 'screens/create-or-edit';

import schema from 'libs/state';

import s from './styles';


const model = {
    email: '',
    study: '',
    doctor: {},
    studies: {},
    studyPicker: {},
};

export const PatientEmail = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        onPatientAdded: PropTypes.func.isRequired,
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired, // eslint-disable-line
        services: PropTypes.shape({
            createPatientService: PropTypes.func.isRequired,
            getDoctorByEmailService: PropTypes.func.isRequired,
            getStudiesService: PropTypes.func.isRequired,
        }),
    },

    componentWillMount() {
        this.props.tree.email.on('update', this.resetResult);

        this.loadStudies();
    },

    componentWillUnmount() {
        this.props.tree.email.off('update', this.resetResult);
    },

    resetResult() {
        this.props.tree.doctor.set({});
    },

    async loadStudies() {
        const result = await this.context.services.getStudiesService(
            this.props.tree.studies
        );

        return result;
    },

    async onSubmit() {
        const email = this.props.tree.get('email');

        await this.context.services.getDoctorByEmailService(
            this.props.tree.doctor,
            email
        );
    },

    goToCreatePatient() {
        this.context.mainNavigator.push(
            getCreateOrEditPatientRoute({
                tree: this.props.tree.select('newPatient'),
                title: 'New Patient',
                service: this.context.services.createPatientService,
                onActionComplete: this.props.onPatientAdded,
                email: this.props.tree.get('email'),
            }, this.context)
        );
    },

    renderButton() {
        const email = this.props.tree.get('email');
        const doctor = this.props.tree.get('doctor');

        if (!email) {
            return (
                <View style={s.labelWrapper}>
                    <TouchableOpacity
                        onPress={this.goToCreatePatient}
                        activeOpacity={0.5}
                    >
                        <Text style={{ color: '#ACB5BE' }}>
                            Continue without email
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (doctor && doctor.status === 'Loading') {
            return (
                <View style={s.activityWrapper}>
                    <ActivityIndicator
                        animating
                        size="large"
                        color="#FF1D70"
                    />
                </View>
            );
        }

        // Doctor is not founded --> can create new
        if (doctor && doctor.status === 'Succeed' &&
            _.isEmpty(doctor.data)) {
            return (
                <View style={s.buttonWrapper}>
                    <Button
                        title="Create new patient"
                        onPress={this.goToCreatePatient}
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
        const studies = this.props.tree.get('studies');
        const doctor = this.props.tree.get('doctor');
        const isLoading = studies.status === 'Loading';
        const isPatient = doctor && doctor.status === 'Succeed'
            && (doctor.data.isParticipant || _.isEmpty(doctor.data));

        return (
            <Updater
                service={this.loadStudies}
                ref={(ref) => { this.scrollView = ref; }}
            >
                <View style={s.container}>
                    {isLoading ?
                        <View style={s.activityIndicator}>
                            <ActivityIndicator
                                animating
                                size="large"
                                color="#FF1D70"
                            />
                        </View>
                    : null}
                    <View style={s.inner}>
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
                                    onPress={() => this.scrollView.scrollTo({ x: 0, y: 320, animated: true })}
                                />
                            : null}
                            {this.renderButton()}
                        </Form>
                    </View>
                </View>
            </Updater>
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
