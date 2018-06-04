import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {
    AlertIOS,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import moment from 'moment';
import SignatureCapture from 'react-native-signature-capture';
import backIcon from 'components/icons/back/back.png';
import { Button } from 'components';
import s from './styles';

const SignatureScreen = createReactClass({
    propTypes: {
        navigator: PropTypes.object.isRequired, // eslint-disable-line
        onSave: PropTypes.func.isRequired,
    },

    getInitialState() {
        return {
            isLoading: false,
            hasLines: false,
        };
    },

    onSave() {
        this.signature.saveImage();
    },

    onClear() {
        this.signature.resetImage();
        this.setState({ hasLines: false });
    },

    async handleSignature(result) {
        this.setState({ isLoading: true });
        await this.props.onSave(result);
        this.setState({ isLoading: false });
    },

    handleDrag() {
        this.setState({ hasLines: true });
    },

    render() {
        const { isLoading, hasLines } = this.state;
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
                    onDragEvent={this.handleDrag}
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
                        onPress={this.onClear}
                    >
                        <Text style={s.buttonText}>Clear</Text>
                    </TouchableOpacity>
                </View>
                {
                    hasLines
                    ?
                    (
                        <View style={s.footer}>
                            <View style={s.buttonWrapper}>
                                <Button
                                    title="Done"
                                    onPress={this.onSave}
                                />
                            </View>
                        </View>
                    )
                    :
                    null
                }
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


export function checkConsent(patientCursor, updatePatientConsentService, mainNavigator) {
    const isConsentValid = moment(patientCursor.get('validConsent', 'data', 'dateExpired')) > moment();
    if (!isConsentValid) {
        return new Promise((resolve) => {
            AlertIOS.alert(
                'The consent is expired',
                'Please, update the patient\'s consent.',
                () => mainNavigator.push(
                    getSignatureRoute({
                        navigator: mainNavigator,
                        onReject: () => resolve(false),
                        onSave: async (signatureData) => {
                            await updatePatientConsentService(
                                patientCursor.get('pk'),
                                patientCursor.validConsent,
                                signatureData.encoded,
                            );
                            mainNavigator.pop();
                            setTimeout(() => resolve(true), 1000);
                        },
                    })));
        });
    }
    return new Promise((resolve) => resolve(true));
}
