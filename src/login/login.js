import React, { PropTypes } from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    Alert,
    View,
    StyleSheet,
    NavigatorIOS,
} from 'react-native';
import { Input, Button, StartScreen, ClickableText } from 'components';
import tree from 'libs/tree';
import schema from 'libs/state';
import { loginService } from 'libs/services/login';
import ResetPassword from './reset-password';
import SignUp from './sign-up';

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
                JSON.stringify(result));
        }
    },

    goToSignUp() {
        // this.props.navigator.push(_.merge({}, route, { component: SignUp }));
    },

    goToResetPassword() {
        // this.props.navigator.push(_.merge({}, route, { component: ResetPassword }));
    },

    render() {
        const emailCursor = this.props.tree.email;
        const passwordCursor = this.props.tree.password;

        return (
            <StartScreen>
                <Input label="Email" cursor={emailCursor} />
                <Input label="Password" cursor={passwordCursor} secureTextEntry />
                <Button title="Login" onPress={this.submit} />
                <View style={{ marginTop: 42 }}>
                    <ClickableText
                        onPress={this.goToSignUp}
                        text="Sign Up"
                        style={styles.text}
                        clickableAreaStyles={styles.clickableArea}
                    />
                    <ClickableText
                        onPress={this.goToResetPassword}
                        text="Forgot you password?"
                        style={styles.text}
                        clickableAreaStyles={styles.clickableArea}
                    />
                </View>
            </StartScreen>
        );
    },
});

function SignInScreen(props) {
    const model = {
        tree: {
            email: 'demo@demo.com',
            password: 'demopassword',
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

const styles = StyleSheet.create({
    text: {
        color: '#fff',
        fontSize: 12,
        lineHeight: 12,
        textAlign: 'center',
    },
    clickableArea: {
        paddingTop: 8,
        paddingLeft: 30,
        paddingRight: 30,
        paddingBottom: 7,
    },
});
