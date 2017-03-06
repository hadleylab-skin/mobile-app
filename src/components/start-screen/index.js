import React from 'react';
import {
    ScrollView,
    View,
    StatusBar,
} from 'react-native';
import Logo from './components/logo';
import s from './styles';

export const StartScreen = React.createClass({
    displayName: 'StartScreen',

    propTypes: {
        children: React.PropTypes.node.isRequired,
        offset: React.PropTypes.number,
        shouldBeScolledUp: React.PropTypes.bool,
    },

    componentDidUpdate() {
        const { shouldBeScolledUp } = this.props;

        if (shouldBeScolledUp) {
            this.scrollUp();
        }
    },

    scrollUp() {
        const { offset } = this.props;

        this.scrollView.scrollTo({ y: offset, animated: true });
    },

    render() {
        return (
            <ScrollView
                style={s.container}
                centerContent
                ref={(ref) => { this.scrollView = ref; }}
            >
                <View style={s.inner}>
                    <StatusBar hidden />
                    <Logo />
                    {this.props.children}
                </View>
            </ScrollView>
        );
    },
});
