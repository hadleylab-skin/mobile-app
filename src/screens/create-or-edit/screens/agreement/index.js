import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    WebView,
} from 'react-native';
import backIcon from 'components/icons/back/back.png';
import s from './styles';

const HTML = `
<h1>My First Heading</h1>
<p>My first paragraph.</p>
<h1>My First Heading</h1>
<p>My first paragraph.</p>
<h1>My First Heading</h1>
<p>My first paragraph.</p>
<h1>My First Heading</h1>
<p>My first paragraph.</p>
<h1>My First Heading</h1>
<p>My first paragraph.</p>
<h1>My First Heading</h1>
<p>My first paragraph.</p>
`;

const AgreementScreen = React.createClass({
    propTypes: {
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
        onAgree: React.PropTypes.func.isRequired,
    },
    render() {
        return (
            <View style={s.container}>
                <View style={s.header}>
                    <Text style={s.title}>Review</Text>
                    <Text style={s.text}>
                        {"Review the form below, and tap Agree if you're ready to continue."}
                    </Text>
                </View>
                <View style={s.webViewWrapper}>
                    <WebView
                        source={{ html: HTML }}
                        automaticallyAdjustContentInsets={false}
                    />
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
});


export function getAgreementRoute(props) {
    return {
        component: AgreementScreen,
        leftButtonIcon: backIcon,
        onLeftButtonPress: () => props.navigator.pop(),
        tintColor: '#FF1D70',
        passProps: props,
    };
}
