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
<h2>MIT License</h2>
<p>
Copyright (c) 2017 SkinIQ
</p>
<p>
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
</p>
<p>
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
</p>
<p>
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</p>
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
