import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
} from 'react-native';

export default class Patient extends React.Component {
    render() {
        const { firstname, lastname, mrn } = this.props.data;

        return (
            <View style={styles.container}>
                <View style={styles.inner}>
                    <Image
                        source={require('./images/default-user.png')}
                        style={styles.img}
                    />
                    <View style={styles.info}>
                        <Text style={[styles.text, { fontSize: 18 }]}>
                            {`${firstname} ${lastname}`}
                        </Text>
                        <Text style={[styles.text, { opacity: 0.6 }]}>
                            Images: 10
                        </Text>
                        <Text style={[styles.text, { opacity: 0.8 }]}>
                            Last Upload: 2 months ago
                        </Text>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        padding: 15,
    },
    inner: {
        flex: 1,
        alignItems: 'stretch',
        flexWrap: 'nowrap',
        flexDirection: 'row',
    },
    img: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    info: {
        flex: 1,
        paddingLeft: 15,
    },
    text: {
        color: '#333',
        marginBottom: 5,
        fontSize: 14,
    },
});

