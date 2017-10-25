import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    AppRegistry,
} from 'react-native';
import schema from 'libs/state';
import tree from 'libs/tree';
import { LoginScreen } from 'screens/login';
import Main from 'screens/main';

const model = {
    tree: {
        token: {},
        keyPairStatus: {},
        loginScreen: {},
        mainScreen: {},
    },
};

const App = schema(model)(React.createClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
    },
    render() {
        const tokenCursor = this.props.tree.token;
        const loginScreen = this.props.tree.loginScreen;
        const mainScreen = this.props.tree.mainScreen;
        const keyPairStatusCursor = this.props.tree.keyPairStatus;

        if (_.isEmpty(_.keys(this.props.tree.get()))) {
            return null;
        }

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
    },
}));


function skiniq() {
    return (
        <App tree={tree} />
    );
}

export default skiniq;

AppRegistry.registerComponent('skiniq', () => skiniq);
