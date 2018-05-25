import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    StatusBar,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Logo from './components/logo';
import s from './styles';

export const StartScreen = createReactClass({
    displayName: 'StartScreen',

    propTypes: {
        children: PropTypes.node.isRequired,
    },

    render() {
        return (
            <KeyboardAwareScrollView
                style={s.container}
            >
                <View style={s.inner}>
                    <StatusBar barStyle="light-content" />
                    <Logo />
                    {this.props.children}
                </View>
            </KeyboardAwareScrollView>
        );
    },
});
