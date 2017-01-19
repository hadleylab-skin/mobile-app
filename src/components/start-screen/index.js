import React, { Component } from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    StatusBar,
    Dimensions,
} from 'react-native';
import Logo from './components/logo';

export class StartScreen extends Component {
    render() {
        return (
            <View style={styles.container}>
                <ScrollView centerContent>
                    <View style={styles.inner}>
                        <StatusBar hidden />
                        <Logo />
                        {this.props.children}
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF3952',
    },
    inner: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 50,
    },
});
