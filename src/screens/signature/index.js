import React from 'react';
import {
    View,
    Text,
    TouchableHighlight,
    ActivityIndicator,
} from 'react-native';
import SignatureCapture from 'react-native-signature-capture';
import backIcon from 'components/icons/back/back.png';
import s from './styles';

const SignatureScreen = React.createClass({
    propTypes: {
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
        onSave: React.PropTypes.func.isRequired,
    },

    getInitialState() {
        return {
            isLoading: false,
        };
    },

    onSave() {
        this.signature.saveImage();
    },

    async handleSignature(result) {
        this.setState({ isLoading: true });
        await this.props.onSave(result);
        this.setState({ isLoading: false });
    },
    render() {
        const { isLoading } = this.state;
        return (
            <View style={{ flex: 1, flexDirection: 'column' }}>
                {isLoading ?
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating
                            size="large"
                            color="#FF1D70"
                        />
                    </View>
                : null}
                <Text style={{ alignItems: 'center', justifyContent: 'center' }}>
                    Signature Capture Extended
                </Text>
                <SignatureCapture
                    ref={(signature) => { this.signature = signature; }}
                    onSaveEvent={this.handleSignature}
                    style={[{ flex: 1 }, s.signature]}
                    saveImageFileInExtStorage={false}
                    showNativeButtons={false}
                    showTitleLabel={false}
                    viewMode={'portrit'}
                />
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <TouchableHighlight
                        style={s.buttonStyle}
                        onPress={() => this.onSave()}
                    >
                        <Text>Save</Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                        style={s.buttonStyle}
                        onPress={() => this.props.navigator.pop()}
                    >
                        <Text>Reset</Text>
                    </TouchableHighlight>
                </View>
            </View>
        );
    },
});

export function getSignatureRoute(props) {
    return {
        component: SignatureScreen,
        leftButtonIcon: backIcon,
        onLeftButtonPress: () => props.navigator.pop(),
        tintColor: '#FF1D70',
        passProps: props,
    };
}
