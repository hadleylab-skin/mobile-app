import _ from 'lodash';
import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    ScrollView,
    NativeEventEmitter,
    NativeModules,
    ProgressViewIOS,
} from 'react-native';
import OpenFile from 'react-native-doc-viewer';
import schema from 'libs/state';
import { InfoField, Button } from 'components';
import { getSignatureRoute } from 'screens/signature';
import s from '../styles';
import ss from './styles';

const eventEmitter = new NativeEventEmitter(NativeModules.RNReactNativeDocViewer);

export const ConsentDocsScreen = schema({})(React.createClass({
    propTypes: {
        invite: React.PropTypes.object.isRequired, // eslint-disable-line
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
        onSign: React.PropTypes.func.isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        cursors: React.PropTypes.shape({
            patients: BaobabPropTypes.cursor.isRequired,
        }),
        services: React.PropTypes.shape({
            updatePatientConsentService: React.PropTypes.func.isRequired,
            approveInviteService: React.PropTypes.func.isRequired,
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

    render() {
        const { invite } = this.props;
        const study = invite.study;
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
                <ScrollView>
                    <Text style={ss.text}>
                        Please, read this documents {'\n'} and confirm with sign
                    </Text>
                    {_.map(study.consentDocs, (consentDoc, index) => (
                        <InfoField
                            key={consentDoc.pk}
                            title={consentDoc.originalFilename || `Consent doc #${index}`}
                            text={'>'}
                            onPress={() => {
                                OpenFile.openDoc([{
                                    url: consentDoc.file,
                                    fileNameOptional: consentDoc.originalFilename || `Consent doc #${index}`,
                                }], () => {});
                            }}
                        />
                    ))}
                </ScrollView>
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
}));

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
