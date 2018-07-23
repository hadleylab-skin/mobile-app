import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    Text,
    TouchableOpacity,
    WebView,
    ActivityIndicator,
    NativeEventEmitter,
    NativeModules,
} from 'react-native';
import schema from 'libs/state';
import backIcon from 'components/icons/back/back.png';
import { ConsentDocsList } from 'screens/consent-docs/components';
import s from './styles';


const model = (props, context) => ({
    tree: {
        getConsentsResult: context.services.getDefaultConsentDocsService,
    },
});


const eventEmitter = new NativeEventEmitter(NativeModules.RNReactNativeDocViewer);


const AgreementScreen = schema(model)(createReactClass({
    propTypes: {
        navigator: PropTypes.object.isRequired, // eslint-disable-line
        onAgree: PropTypes.func.isRequired,
    },

    contextTypes: {
        services: PropTypes.shape({
            getDefaultConsentDocsService: PropTypes.func.isRequired,
        }),
    },

    componentDidMount() {
        eventEmitter.addListener('RNDownloaderProgress', () => null);
        eventEmitter.addListener('DoneButtonEvent', () => null);
    },

    componentWillUnmount() {
        eventEmitter.removeAllListeners('RNDownloaderProgress');
        eventEmitter.removeAllListeners('DoneButtonEvent');
    },

    render() {
        const result = this.props.tree.getConsentsResult.get();
        if (!result) {
            return null;
        }

        if (result.status === 'Loading') {
            return (
                <View style={s.container}>
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating
                            size="large"
                            color="#FF1D70"
                        />
                    </View>
                </View>
            );
        }

        return (
            <View style={s.container}>
                <View style={s.webViewWrapper}>
                    {_.isEmpty(result.data.docs) ?
                        <WebView
                            source={{ html: result.data.page }}
                            automaticallyAdjustContentInsets={false}
                            scalesPageToFit={false}
                        />
                        :
                        <ConsentDocsList
                            consentDocs={result.data.docs}
                        />
                    }
                </View>
                <View style={s.buttons}>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={s.button}
                        onPress={() => this.props.navigator.pop()}
                    >
                        <Text style={s.buttonText}>Disagree</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={[s.button, s.buttonRight]}
                        onPress={() => { this.props.onAgree(); }}
                    >
                        <Text style={s.buttonText}>Agree</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    },
}));


export function getAgreementRoute(props) {
    return {
        component: AgreementScreen,
        leftButtonIcon: backIcon,
        onLeftButtonPress: () => props.navigator.pop(),
        tintColor: '#FF1D70',
        passProps: props,
    };
}
