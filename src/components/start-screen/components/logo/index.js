import React from 'react';
import {
    View,
    StyleSheet,
    Image,
} from 'react-native';

export default class Logo extends React.Component {
    render() {
        return (
            <Image
                source={require('./images/skin.png')}
                style={styles.image}
            />
        );
    }
}

const styles = StyleSheet.create({
    image: {
        width: 200,
        height: 95,
        marginBottom: 100,
    },
});

