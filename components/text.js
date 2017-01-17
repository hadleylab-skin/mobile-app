import React from 'react';
import {
    StyleSheet,
    Text,
} from 'react-native';

export class AppText extends React.Component {
    render() {
        return (
            <Text style={[styles.text, this.props.style]}>
                {this.props.children}
            </Text>
        );
    }
}

const styles = StyleSheet.create({
    text: {
        color: '#fff',
        fontSize: 16,
        lineHeight: 16,
    },
});

