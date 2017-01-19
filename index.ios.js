import React, { Component } from 'react';
import {
    AppRegistry,
    NavigatorIOS,
} from 'react-native';
import { Login } from './src/login';

export default class skiniq extends Component {
    render() {
        return (
            <NavigatorIOS
                initialRoute={{
                    component: Login,
                    title: 'Login',
                    navigationBarHidden: true,
                }}
                style={{ flex: 1 }}
            />
        );
    }
}

AppRegistry.registerComponent('skiniq', () => skiniq);
