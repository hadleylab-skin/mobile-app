import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    StatusBar,
} from 'react-native';
import Logo from './components/logo';

export class StartScreen extends Component {
    render() {
        return (
            <View style={styles.container}>
                <StatusBar hidden />
                <Logo />
                {this.props.children}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FF3952',
    },
});
