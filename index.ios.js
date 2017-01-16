import React, { Component } from 'react';
import {
    Alert,
    AppRegistry,
    Button,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Input } from 'components';
import tree from 'libs/tree';

function submit(){
    Alert.alert(
        'Login',
        'wrong username or password');
}

export default class skiniq extends Component {
    render() {
        const loginCursor = tree.login;
        const passwordCursor = tree.password;

        return (
            <View style={styles.container}>
                <Input label="Enter your login" cursor={loginCursor} />
                <Input label="Enter your password" cursor={passwordCursor} />
                <Button title="Login" onPress={submit} />
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
