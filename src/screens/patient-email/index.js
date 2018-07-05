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

import schema from 'libs/state';

import s from './styles';


const model = {
    email: '',
    getDoctorResult: {},
};


export const PatientEmail = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired, // eslint-disable-line
        services: PropTypes.shape({
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

    async onSubmit() {
        const email = this.props.tree.get('email');

        const result = await this.context.services.getDoctorByEmailService(
            this.props.tree.getDoctorResult,
            email
        );
        console.log(result);
    },

    renderButton() {
        const email = this.props.tree.get('email');
        const getDoctorResult = this.props.tree.get('getDoctorResult');

        if (!email) {
            return (
                <View style={s.labelWrapper}>
                    <TouchableOpacity
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
                    />
                </View>
            );
        }

        // Doctor is participant --> can invite him to study
        if (getDoctorResult && getDoctorResult.status === 'Succeed' &&
            getDoctorResult.data.isParticipant) {
            return (
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
