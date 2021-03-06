import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    AppRegistry,
} from 'react-native';
import schema from 'libs/state';
import tree from 'libs/tree';
import { LoginScreen } from 'screens/login';
import Main from 'screens/main';

const App = schema({})(createReactClass({
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


function skin() {
    return (
        <App tree={tree} />
    );
}

AppRegistry.registerComponent('skin', () => skin);

export default skin;

