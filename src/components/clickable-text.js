import React from 'react';
import {
    Text,
    View,
    TouchableHighlight,
} from 'react-native';

export class ClickableText extends React.Component {
    render() {
        return (
            <TouchableHighlight
                style={this.props.clickableAreaStyles}
                onPress={this.props.onPress}
                underlayColor="rgba(255,255,255,0.2)">
                <View>
                    <Text style={this.props.style}>
                        {this.props.text}
                    </Text>
                </View>
            </TouchableHighlight>
        );
    }
}

