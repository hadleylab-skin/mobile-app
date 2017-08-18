import React, { PropTypes } from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    Alert,
    View,
    Text,
    NavigatorIOS,
} from 'react-native';
import { Input, Button, StartScreen, ClickableText, Form } from 'components';
import tree from 'libs/tree';
import schema from 'libs/state';
import { loginService } from 'services/login';
import ResetPassword from './screens/reset-password';
import SignUp from './screens/sign-up';
import s from './styles';

// BEGIN

import { StyleSheet, StatusBar, Event } from 'react-native';
import { requireNativeComponent } from 'react-native';
import { NativeEventEmitter, NativeModules } from 'react-native'

const BodyViewEventEmitter = NativeModules.BodyViewEventEmitter
const eventEmitter = new NativeEventEmitter(BodyViewEventEmitter)

NativeBodyView3D = requireNativeComponent('BodyView', BodyView3D);

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover',
    backgroundColor: 'rgba(172, 182, 190, 1.0)'
  },
});

class BodyView3D extends React.Component
{
  constructor(props) {
    super(props)
    this._onBodyPartSelected = this._onBodyPartSelected.bind(this);
  }
  
  _onBodyPartSelected = (data) => {
    console.log(data);
    if (this.props.onBodyPartSelected) {
      this.props.onBodyPartSelected(data);
    }
  }

  _onMoleAdded = (data) => {
    console.log(data);
    if (this.props.onMoleAdded) {
      this.props.onMoleAdded(data);
    }
  }
  
  _onMoleSelected = (data) => {
    console.log(data);
    if (this.props.onMoleSelected) {
      this.props.onMoleSelected(data);
    }
  }

  render() {
    eventEmitter.addListener('BodyPartSelectedEvent', this._onBodyPartSelected)
    eventEmitter.addListener('MoleAddedEvent', this._onMoleAdded)
    eventEmitter.addListener('MoleSelectedEvent', this._onMoleSelected)
    return <NativeBodyView3D {...this.props}/>
  }
};

BodyView3D.propTypes = {
  sex: PropTypes.oneOf([ 'male', 'female' ]),
  moles: PropTypes.array,
  onBodyPartSelected: PropTypes.func,
  onMoleAdded: PropTypes.func,
  onMoleSelected: PropTypes.func,
};

// END

const route = {
    title: 'Login',
    navigationBarHidden: true,
};

const SignInComponent = React.createClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
    },

    async submit() {
        const result = await loginService(this.props.tokenCursor, this.props.tree.get());

        if (result.status === 'Failure') {
            Alert.alert(
                'Login',
                'Wrong email or password');
        }
    },

    goToSignUp() {
        this.props.navigator.push(_.merge({}, route, { component: SignUp }));
    },

    goToResetPassword() {
        this.props.navigator.push(_.merge({}, route, { component: ResetPassword }));
    },

    render() {
// BEGIN
        var sex = 'male';
        var moles = [ 'a', 'b' ];
    
        return (
            <BodyView3D
                style={styles.backgroundImage}
                sex={sex}
                moles={moles}
                onBodyPartSelected={(data) => console.log('onBodyPartSelected')}
                onMoleAdded={(data) => console.log('onMoleAdded')}
                onMoleSelected={(data) => console.log('onMoleSelected')}/>);
// END
        const usernameCursor = this.props.tree.username;
        const passwordCursor = this.props.tree.password;

        return (
            <StartScreen>
                <Form onSubmit={this.submit}>
                    <Text style={s.label}>EMAIL</Text>
                    <Input
                        label="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                        autoCorrect={false}
                        cursor={usernameCursor}
                        inputWrapperStyle={s.inputWrapper}
                        inputStyle={s.input}
                        placeholderTextColor="rgba(255,255,255,0.7)"
                    />
                    <Text style={s.label}>PASSWORD</Text>
                    <Input
                        label="Password"
                        returnKeyType="done"
                        cursor={passwordCursor}
                        inputWrapperStyle={s.inputWrapper}
                        inputStyle={s.input}
                        secureTextEntry
                        placeholderTextColor="rgba(255,255,255,0.7)"
                    />
                </Form>
                <View style={s.button}>
                    <Button title="Login" onPress={this.submit} type="white" />
                </View>
                {/*
                <View style={{ marginTop: 42 }}>
                    <ClickableText
                        onPress={this.goToSignUp}
                        text="Sign Up"
                        style={s.text}
                        clickableAreaStyles={s.clickableArea}
                    />
                    <ClickableText
                        onPress={this.goToResetPassword}
                        text="Forgot you password?"
                        style={s.text}
                        clickableAreaStyles={s.clickableArea}
                    />
                </View>
                */}
            </StartScreen>
        );
    },
});

function SignInScreen(props) {
    const model = {
        tree: {
            username: '',
            password: '',
        },
    };
    const loginScreenCursor = tree.login;
    const Component = schema(model)(SignInComponent);
    return (
        <Component
            {...props}
            tree={loginScreenCursor}
            tokenCursor={props.tokenCursor}
        />
    );
}

export class Login extends React.Component {
    render() {
        return (
            <NavigatorIOS
                initialRoute={{
                    component: SignInScreen,
                    title: 'Login',
                    navigationBarHidden: true,
                    passProps: {
                        tree: this.props.tree,
                        tokenCursor: this.props.tokenCursor,
                    },
                }}
                style={{ flex: 1 }}
            />
        );
    }
}
