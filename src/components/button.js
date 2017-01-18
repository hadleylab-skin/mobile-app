import React from 'react';
import {
    StyleSheet,
    Text,
} from 'react-native';

export class Button extends React.Component {
    render() {
        return (
            <Text
                style={styles.button}
                onPress={this.props.onPress}
            >
                {this.props.title}
            </Text>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        height: 40,
        width: 140,
        color: '#fff',
        textAlign: 'center',
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 20,
        fontSize: 20,
        lineHeight: 20,
        marginTop: 30,
        padding: 10,
    },
});

