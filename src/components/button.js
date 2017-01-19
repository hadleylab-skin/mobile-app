import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
} from 'react-native';

export class Button extends React.Component {
    render() {
        return (
            <TouchableHighlight
                style={styles.button}
                onPress={this.props.onPress}
                underlayColor="rgba(255,255,255,0.2)"
            >
                <View>
                    <Text style={styles.text}>
                        {this.props.title}
                    </Text>
                </View>
            </TouchableHighlight>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        height: 40,
        width: 140,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 20,
        marginTop: 30,
        padding: 10,
    },
    text: {
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 20,
    },
});

