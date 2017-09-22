import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    AppRegistry,
} from 'react-native';
import schema from 'libs/state.js';
import tree from 'libs/tree';
import { LoginScreen } from 'screens/login';
import Main from 'screens/main';

const model = {
    tree: {
        token: '',
        keyPairStatus: {},
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
            <LoginScreen
                tree={loginScreen}
                tokenCursor={tokenCursor}
                keyPairStatusCursor={keyPairStatusCursor}
            />
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
