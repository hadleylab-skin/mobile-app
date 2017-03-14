import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    AppRegistry,
} from 'react-native';
import schema from 'libs/state';
import tree from 'libs/tree';
import { Login } from './src/login';
import Main from './src/main';

const model = {
    tree: {
        token: '',
        loginScreen: {},
        mainScreen: {},
    },
};

function App(props) {
    const tokenCursor = props.tree.token;
    const loginScreen = props.tree.loginScreen;
    const mainScreen = props.tree.mainScreen;

    if (tokenCursor.get('status') !== 'Succeed') {
        return (
            <Login tokenCursor={tokenCursor} tree={loginScreen} />
        );
    }
    return (
        <Main
            tree={mainScreen}
            token={tokenCursor.get('data', 'token')}
            user={tokenCursor.get('data', 'user')}
            defaultPatient={tokenCursor.get('data', 'patient')}
        />
    );
}

App.propTypes = {
    tree: BaobabPropTypes.cursor.isRequired,
};

function skiniq() {
    const Component = schema(model)(App);

    return <Component tree={tree} />;
}

export default skiniq;

AppRegistry.registerComponent('skiniq', () => skiniq);
