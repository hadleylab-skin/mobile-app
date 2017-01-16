/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TextInput,
} from 'react-native';
import tree from './libs/tree';
import schema from './libs/state';

const Input = schema({cursor:"hello"})(({ cursor }) => {
    debugger;
    return (
        <View>
            <Text>{cursor.get()}</Text>
            <TextInput
                style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                onChangeText={(text) => cursor.set(text)}
                value={cursor.get()}
            />
        </View>
    );
});

export default class skiniq extends Component {
    render() {
        const loginCursor = tree.login;
        const passwordCursor = tree.password;

        return (
            <View style={styles.container}>
                <Input cursor={loginCursor}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('skiniq', () => skiniq);
