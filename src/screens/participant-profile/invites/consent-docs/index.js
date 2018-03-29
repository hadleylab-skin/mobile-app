import _ from 'lodash';
import React from 'react';
import {
    View,
    Text,
    ScrollView,
    NativeEventEmitter,
    NativeModules,
    ProgressViewIOS
} from 'react-native';
import OpenFile from 'react-native-doc-viewer';
import { InfoField, Button } from 'components';
import s from '../styles';
import ss from './styles';

const eventEmitter = new NativeEventEmitter(NativeModules.RNReactNativeDocViewer);

export const ConsentDocsScreen = React.createClass({
    propTypes: {
        study: React.PropTypes.object.isRequired,
    },

    getInitialState() {
        return {
            progress: 0,
        };
    },

    componentDidMount(){
        eventEmitter.addListener(
            'RNDownloaderProgress',
            (Event) => {
                const progress = Event.progress / 100.0;
                this.setState({ progress });
            }
        );
    },

    render() {
        const { study } = this.props;
        const { progress } = this.state;

        if (progress > 0 && progress < 1) {
            return (
                <View style={s.container}>
                    <ProgressViewIOS progress={progress}/>
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
                                    fileNameOptional: consentDoc.originalFilename || `Consent doc #${index}`
                                }], (error, url) => {});
                            }}
                        />
                    ))}
                </ScrollView>
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
