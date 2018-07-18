import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    NativeEventEmitter,
    NativeModules,
    ProgressViewIOS,
} from 'react-native';
import { Button } from 'components';
import { getSignatureRoute } from 'screens/signature';
import { ConsentDocsList } from './components';
import s from './styles';

const eventEmitter = new NativeEventEmitter(NativeModules.RNReactNativeDocViewer);

export const ConsentDocsScreen = createReactClass({
    propTypes: {
        study: PropTypes.object.isRequired, // eslint-disable-line
        navigator: PropTypes.object.isRequired, // eslint-disable-line
        onSign: PropTypes.func.isRequired,
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired, // eslint-disable-line
        cursors: PropTypes.shape({
            patients: BaobabPropTypes.cursor.isRequired,
        }),
        services: PropTypes.shape({
            updatePatientConsentService: PropTypes.func.isRequired,
            approveInviteService: PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        return {
            progress: 0,
        };
    },

    componentDidMount() {
        eventEmitter.addListener(
            'RNDownloaderProgress',
            (Event) => {
                const progress = Event.progress / 100.0;
                this.setState({ progress });
            }
        );
    },

    componentWillUnmount() {
        eventEmitter.removeAllListeners('RNDownloaderProgress');
    },

    render() {
        const { study } = this.props;
        const { progress } = this.state;

        if (progress > 0 && progress < 1) {
            return (
                <View style={s.container}>
                    <ProgressViewIOS progress={progress} />
                </View>
            );
        }

        return (
            <View style={s.container}>
                <ConsentDocsList
                    consentDocs={study.consentDocs}
                />
                <View style={s.buttons}>
                    <Button
                        type="green"
                        title="Accept"
                        style={s.button}
                        onPress={() => {
                            this.context.mainNavigator.push(
                                getSignatureRoute({
                                    navigator: this.props.navigator,
                                    onSave: this.props.onSign,
                                })
                            );
                        }}
                    />
                </View>
            </View>
        );
    },
});

export function getConsentDocsScreenRoute(props, context) {
    return {
        component: ConsentDocsScreen,
        title: 'Consent docs',
        onLeftButtonPress: () => context.mainNavigator.pop(),
        navigationBarHidden: false,
        leftButtonIcon: require('components/icons/back/back.png'),
        tintColor: '#FF1D70',
        passProps: props,
    };
}
