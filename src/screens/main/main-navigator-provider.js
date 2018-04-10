import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    StatusBar,
    TabBarIOS,
    NavigatorIOS,
    View,
    Text,
    Modal,
} from 'react-native';
import { getRacesList } from 'services/constants';
import schema from 'libs/state';
import { ServiceProvider } from 'components';
import { PatientsList } from 'screens/patients-list';
import { DoctorProfile } from 'screens/doctor-profile';
import { ParticipantProfile } from 'screens/participant-profile';
import { CameraMenu } from 'screens/camera-menu';
import { CryptoConfiguration } from 'screens/crypto-config';
import { CreateOrEditPatient } from 'screens/create-or-edit';
import Main from './main';


export default React.createClass({
    displayName: 'MainNavigatorProvider',

    propTypes: NavigatorIOS.propTypes,

    childContextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    getChildContext() {
        return {
            mainNavigator: this.mainNavigator || {},
        };
    },

    render() {
        return (
            <NavigatorIOS
                ref={(ref) => { this.mainNavigator = ref; }}
                {...this.props}
            />
        );
    },
});
