import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    AppRegistry,
} from 'react-native';
import { getKeyPairStatus } from 'services/keypair';
import schema from 'libs/state.js';
import tree from 'libs/tree';
import { Login } from 'screens/login';
import Main from 'screens/main';

const model = {
    tree: {
        token: '',
        keyPairStatus: getKeyPairStatus,
        loginScreen: {},
        mainScreen: {},
    },
};

function App(props) {
    const tokenCursor = props.tree.token;
    const loginScreen = props.tree.loginScreen;
    const mainScreen = props.tree.mainScreen;
    const keyPairStatusCursor = props.tree.keyPairStatus;

    if (tokenCursor.get('status') !== 'Succeed') {
        return (
            <Login tokenCursor={tokenCursor} tree={loginScreen} />
        );
    }

    return (
        <Main
            tree={mainScreen}
            tokenCursor={tokenCursor}
            keyPairStatusCursor={keyPairStatusCursor}
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
