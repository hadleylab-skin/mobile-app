import React from 'react';
import {
    View,
    Text,
    TouchableHighlight,
    WebView,
} from 'react-native';
import backIcon from 'components/icons/back/back.png';
import s from './styles';

const HTML = `
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
            <View style={{ flex: 1, flexDirection: 'column' }}>
                <WebView
                    source={{ html: HTML }}
                    style={[{ flex: 3 }, s.agreement]}
                />
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <TouchableHighlight
                        style={s.buttonStyle}
                        onPress={() => { this.props.onAgree(); }}
                    >
                        <Text>Agree</Text>
                    </TouchableHighlight>

                    <TouchableHighlight
                        style={s.buttonStyle}
                        onPress={() => this.props.navigator.pop()}
                    >
                        <Text>Decline</Text>
                    </TouchableHighlight>

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
