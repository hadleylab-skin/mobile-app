import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TextInput,
} from 'react-native';
import { Input } from 'components';
import tree from 'libs/tree';

export default class skiniq extends Component {
    render() {
        const loginCursor = tree.login;

        return (
            <View style={styles.container}>
                <Input defaultValue="Enter your login" cursor={loginCursor} />
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
