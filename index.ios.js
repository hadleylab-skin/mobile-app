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

const model = {
    cursor: 'hello',
};


const Input = schema(model)(({ cursor }) => (
    <View>
        <Text>{cursor.get()}</Text>
        <TextInput
            onChangeText={(text) => cursor.set(text)}
            value={cursor.get()}
        />
    </View>
    )
);

export default class skiniq extends Component {
    render() {
        const loginCursor = tree.login;

        return (
            <View style={styles.container}>
                <Input cursor={loginCursor} />
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
