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
    Input, Form, Button,
} from 'components';
import { getCreateOrEditPatientRoute } from 'screens/create-or-edit';

import schema from 'libs/state';

import s from './styles';


const model = {
    email: '',
    getDoctorResult: {},
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
        }),
    },

    componentWillMount() {
        this.props.tree.email.on('update', this.resetResult);
    },

    componentWillUnmount() {
        this.props.tree.email.off('update', this.resetResult);
    },

    resetResult() {
        this.props.tree.getDoctorResult.set({});
    },

    onSubmit() {
        const email = this.props.tree.get('email');

        this.context.services.getDoctorByEmailService(
            this.props.tree.getDoctorResult,
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
            }, this.context)
        );
    },

    renderButton() {
        const email = this.props.tree.get('email');
        const getDoctorResult = this.props.tree.get('getDoctorResult');

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

        if (getDoctorResult && getDoctorResult.status === 'Loading') {
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
        if (getDoctorResult && getDoctorResult.status === 'Succeed' &&
            _.isEmpty(getDoctorResult.data)) {
            return (
                <View style={s.buttonWrapper}>
                    <Button
                        title={'Create new patient'}
                        onPress={this.goToCreatePatient}
                    />
                </View>
            );
        }

        // Doctor is participant --> can invite him to study
        if (getDoctorResult && getDoctorResult.status === 'Succeed' &&
            getDoctorResult.data.isParticipant) {
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
        if (getDoctorResult && getDoctorResult.status === 'Succeed') {
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
        return (
            <View style={s.container}>
                <View style={s.inner}>
                    <Form
                        onSubmit={this.onSubmit}
                    >
                        <Input
                            label={'Email'}
                            cursor={this.props.tree.email}
                            returnKeyType="next"
                            inputWrapperStyle={s.hasBottomBorder}
                            errorWrapperStyle={s.errorEmail}
                            inputStyle={[s.input, s.inputEmail]}
                            placeholderTextColor="#ACB5BE"
                            errorPlaceholderTextColor="#FC3159"
                            name="email"
                        />
                        {this.renderButton()}
                    </Form>
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
