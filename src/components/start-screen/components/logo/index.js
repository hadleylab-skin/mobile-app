import React from 'react';
import {
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
        width: 150,
        height: 72,
        marginBottom: 50,
    },
});

