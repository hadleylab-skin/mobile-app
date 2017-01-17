import React, { Component } from 'react';
import {
    AppRegistry,
} from 'react-native';
import Login from './src/login';
import ResetPassword from './src/reset-password';
import SignUp from './src/sign-up';

export default class skiniq extends Component {
    render() {
        return (
            <Login />
        );
    }
}

AppRegistry.registerComponent('skiniq', () => skiniq);
