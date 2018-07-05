import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import {
    Input, Form, Button,
} from 'components';

import schema from 'libs/state';

import s from './styles';


const model = {
    email: '',
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

    onSubmit() {
        console.log('SUBMIT');
    },

    render() {
        const email = this.props.tree.get('email');

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

                        {email ?
                            <View style={s.buttonWrapper}>
                                <Button
                                    title={'Search'}
                                    onPress={this.onSubmit}
                                />
                            </View>
                        :
                            <View style={s.skipLabelWrapper}>
                                <TouchableOpacity
                                    activeOpacity={0.5}
                                >
                                    <Text style={{ color: '#ACB5BE' }}>
                                        Continue without email
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        }
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
