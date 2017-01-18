import React, { Component } from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    StatusBar,
} from 'react-native';
import Logo from './components/logo';

export class StartScreen extends Component {
    render() {
        return (
            <ScrollView style={{ backgroundColor: '#FF3952' }}>
                <View style={styles.container}>
                    <StatusBar hidden />
                    <Logo />
                    {this.props.children}
                </View>
            </ScrollView>
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
