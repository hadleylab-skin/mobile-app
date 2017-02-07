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
import moment from 'moment';
import schema from 'libs/state';

let styles = {};

const ImageInfo = schema({})(React.createClass({
    displayName: 'ImageInfo',

    getInitialState() {
        return {
            canUpdate: true,
        };
    },

    updateImage() {
        return this.props.imageService(
            this.props.patientPk,
            this.props.cursor.get('data', 'id'),
            this.props.cursor);
    },

    async onScroll(e) {
        const offset = e.nativeEvent.contentOffset.y;
        if (offset < -130 && this.state.canUpdate && this.props.cursor.status.get() !== 'Loading') {
            this.setState({ canUpdate: false });
            await this.updateImage();
        }
        if (offset > -70) {
            this.setState({ canUpdate: true });
        }
    },

    render() {
        const {
            date_created, clinical_diagnosis,
            prediction_accuracy, prediction,
            clinical_photo,
        } = this.props.cursor.get('data');
        const showLoader = this.props.cursor.status.get() === 'Loading';

        return (
            <View style={styles.container}>
                <StatusBar hidden={false} />
                { showLoader ?
                    <View style={styles.activityIndicator}>
                        <ActivityIndicator
                            animating={showLoader}
                            size="large"
                            color="#FF2D55"
                        />
                    </View>
                :
                    null
                }
                <ScrollView
                    onScroll={this.onScroll}
                    scrollEventThrottle={200}
                >
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
                        <Text style={[styles.text, styles.textRight]}>Uploaded on:</Text>
                        <Text style={styles.text}>{moment(date_created).format('DD MMM YYYY')}</Text>
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
}));

export default ImageInfo;

styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
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
    activityIndicator: {
        position: 'absolute',
        top: 85,
        left: 0,
        right: 0,
        justifyContent: 'center',
        zIndex: 1,
    },
});
