import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TouchableHighlight,
    ActivityIndicator,
} from 'react-native';
import SignatureCapture from 'react-native-signature-capture';
import backIcon from 'components/icons/back/back.png';
import { Button } from 'components';
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
            <View style={s.container}>
                <View style={s.header}>
                    <Text style={s.title}>Signature</Text>
                    <Text style={s.text}>Please sign using your finger on the line below</Text>
                </View>
                {isLoading ?
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating
                            size="large"
                            color="#FF1D70"
                        />
                    </View>
                : null}
                <SignatureCapture
                    ref={(signature) => { this.signature = signature; }}
                    onSaveEvent={this.handleSignature}
                    style={s.signature}
                    saveImageFileInExtStorage={false}
                    showNativeButtons={false}
                    showTitleLabel={false}
                    viewMode={'portrait'}
                />
                <View style={{ alignItems: 'center', marginTop: 10 }}>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={s.button}
                        onPress={() => this.props.navigator.pop()}
                    >
                        <Text style={s.buttonText}>Clear</Text>
                    </TouchableOpacity>
                </View>
                <View style={s.footer}>
                    <View style={s.buttonWrapper}>
                        <Button
                            title="Done"
                            onPress={() => this.onSave()}
                        />
                    </View>
                </View>
            </View>
        );
    },
});

export function getSignatureRoute(props) {
    return {
        component: SignatureScreen,
        leftButtonIcon: backIcon,
        onLeftButtonPress: () => {
            props.navigator.pop();
            (props.onReject || (() => {}))();
        },
        tintColor: '#FF1D70',
        passProps: props,
    };
}
