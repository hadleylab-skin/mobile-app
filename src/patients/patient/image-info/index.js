import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
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
import s from './styles';

const ImageInfo = schema({})(React.createClass({
    displayName: 'ImageInfo',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
        patientPk: React.PropTypes.number.isRequired,
        imageService: React.PropTypes.func.isRequired,
    },

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
            <View style={s.container}>
                <StatusBar hidden={false} />
                { showLoader ?
                    <View style={s.activityIndicator}>
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
                    <View style={s.imageWrapper}>
                        <View style={s.indicator}>
                            <ActivityIndicator
                                animating
                                size="large"
                                color="#FF2D55"
                            />
                        </View>
                        <Image
                            source={{ uri: clinical_photo.full_size }}
                            style={s.photo}
                        />
                    </View>
                    <View style={s.table}>
                        <Text style={[s.text, s.textRight]}>Uploaded on:</Text>
                        <Text style={s.text}>{moment(date_created).format('DD MMM YYYY')}</Text>
                    </View>
                    <View style={s.table}>
                        <Text style={[s.text, s.textRight]}>Clinical diagnosis:</Text>
                        <Text style={s.text}>{clinical_diagnosis}</Text>
                    </View>
                    <View style={s.table}>
                        <Text style={[s.text, s.textRight]}>Prediction accuracy:</Text>
                        <Text style={s.text}>{prediction_accuracy}</Text>
                    </View>
                    <View style={s.table}>
                        <Text style={[s.text, s.textRight]}>Prediction:</Text>
                        <Text style={s.text}>{prediction}</Text>
                    </View>
                </ScrollView>
            </View>
        );
    },
}));

export default ImageInfo;
