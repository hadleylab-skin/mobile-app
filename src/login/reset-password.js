import React, { Component, PropTypes } from 'react';
import {
    Alert,
    View,
    StyleSheet,
} from 'react-native';
import { Input, Button, StartScreen, ClickableText } from 'components';
import tree from 'libs/tree';

function submit() {
    Alert.alert(
        'Reset password',
        'Wrong email');
}

const route = {
    title: 'Login',
    navigationBarHidden: true,
}

export default class ResetPassword extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
    }

    goBack = () => {
        this.props.navigator.pop()
    }

    render() {
        const emailCursor = tree.email;

        return (
            <StartScreen>
                <Input label="Email" cursor={emailCursor} />
                <Button title="Reset" onPress={submit} />
                <View style={{ marginTop: 42 }}>
                    <ClickableText
                        onPress={this.goBack}
                        text="Back"
                        style={styles.text}
                        clickableAreaStyles={styles.clickableArea}
                    />
                </View>
            </StartScreen>
        );
    }
}

const styles = StyleSheet.create({
    text: {
        color: '#fff',
        fontSize: 12,
        lineHeight: 12,
    },
    clickableArea: {
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 30,
        paddingRight: 30,
    }
});
