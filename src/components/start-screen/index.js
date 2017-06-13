import React from 'react';
import {
    View,
    StatusBar,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Logo from './components/logo';
import s from './styles';

export const StartScreen = React.createClass({
    displayName: 'StartScreen',

    propTypes: {
        children: React.PropTypes.node.isRequired,
    },

    render() {
        return (
            <KeyboardAwareScrollView
                style={s.container}
                centerContent
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
