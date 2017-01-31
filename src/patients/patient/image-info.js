import React from 'react';
import {
    View,
    Text,
    StatusBar,
    StyleSheet,
    Image,
    Dimensions,
    ScrollView,
    ActivityIndicator,
} from 'react-native';

let styles = {};

const ImageInfo = React.createClass({
    displayName: 'ImageInfo',

    render() {
        const { date_created, clinical_diagnosis,
            prediction_accuracy, prediction, clinical_photo } = this.props.data;

        return (
            <View style={styles.container}>
                <StatusBar hidden={false} />
                <ScrollView>
                    <Text style={styles.date}>Uploaded on {date_created}</Text>
                    <View style={styles.imageWrapper}>
                        <View style={styles.indicator}>
                            <ActivityIndicator
                                animating
                                size="large"
                                color="#FF2D55"
                            />
                        </View>
                        <Image
                            source={{ uri: clinical_photo.full_size }}
                            style={styles.photo}
                        />
                    </View>
                    <View style={styles.table}>
                        <Text style={[styles.text, styles.textRight]}>Clinical diagnosis:</Text>
                        <Text style={styles.text}>{clinical_diagnosis}</Text>
                    </View>
                    <View style={styles.table}>
                        <Text style={[styles.text, styles.textRight]}>Prediction accuracy:</Text>
                        <Text style={styles.text}>{prediction_accuracy}</Text>
                    </View>
                    <View style={styles.table}>
                        <Text style={[styles.text, styles.textRight]}>Prediction:</Text>
                        <Text style={styles.text}>{prediction}</Text>
                    </View>
                </ScrollView>
            </View>
        );
    },
});

export default ImageInfo;

styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    date: {
        margin: 15,
        fontSize: 18,
        lineHeight: 22,
        textAlign: 'center',
    },
    imageWrapper: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').width,
        backgroundColor: '#efefef',
        justifyContent: 'center',
        position: 'relative',
    },
    photo: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').width,
    },
    indicator: {
        position: 'absolute',
        left: 2,
        top: 2,
        right: 2,
        bottom: 2,
        justifyContent: 'center',
    },
    table: {
        flexDirection: 'row',
    },
    text: {
        flex: 1,
        marginTop: 3,
        marginBottom: 3,
        fontWeight: '300',
    },
    textRight: {
        textAlign: 'right',
        paddingRight: 30,
    },
});
