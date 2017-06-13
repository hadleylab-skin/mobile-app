import React from 'react';
import _ from 'lodash';
import {
    View,
    Text,
    Dimensions,
    Image,
    ScrollView,
    ActivityIndicator,
    TouchableWithoutFeedback,
} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import moment from 'moment';
import s from './styles';

const Gallery = React.createClass({
    displayName: 'Gallery',

    propTypes: {
        currentImageId: React.PropTypes.number.isRequired,
        setCurrentImageId: React.PropTypes.func.isRequired,
        images: React.PropTypes.arrayOf(React.PropTypes.shape({
            photo: React.PropTypes.shape({
                fullSize: React.PropTypes.string,
                thumbnail: React.PropTypes.string,
            }),
            dateCreated: React.PropTypes.string,
        })).isRequired,
    },

    contextTypes: {},

    formateDate(date) {
        const formatedDate = moment(date).format('MMMM d, YYYY hh:mm a');

        return formatedDate;
    },

    render() {
        const { currentImageId, setCurrentImageId } = this.props;
        const { width } = Dimensions.get('window');

        return (
            <View style={s.container}>
                <View style={s.carousel}>
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating
                            size="large"
                            color="#FF1D70"
                        />
                    </View>
                    <Carousel
                        ref={(ref) => { this.carousel = ref; }}
                        sliderWidth={width}
                        itemWidth={width}
                        inactiveSlideScale={1}
                        scrollEventThrottle={100}
                        onSnapToItem={(id) => setCurrentImageId(id)}
                    >
                        {_.map(this.props.images, (image, index) => (
                            <View style={s.galleryItem} key={`gallery-image-${index}`}>
                                <View style={s.dateWrraper}>
                                    <Text style={s.date}>
                                        {`uploaded: ${this.formateDate(image.data.dateCreated)}`}
                                    </Text>
                                </View>
                                <Image source={{ uri: image.data.photo.fullSize }} style={s.galleryImage} />
                            </View>
                        ))}
                    </Carousel>
                    <View style={s.dots}>
                        {_.map(this.props.images, (dot, index) => (
                            <View
                                style={[s.dot, currentImageId === index ? s.activeDot : {}]}
                                key={`gallery-dot-${index}`}
                            />
                        ))}
                    </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={s.thumbs}>
                        {_.map(this.props.images, (thumb, index) => (
                            <TouchableWithoutFeedback
                                onPress={() => this.carousel.snapToItem(index)}
                                key={`gallery-thumb-${index}`}
                            >
                                <View
                                    style={[s.thumbWrapper,
                                        currentImageId === index ? s.activeThumb : {}]}
                                >
                                    <Image source={{ uri: thumb.data.photo.thumbnail }} style={s.thumb} />
                                </View>
                            </TouchableWithoutFeedback>
                        ))}
                    </View>
                </ScrollView>
            </View>
        );
    },
});

export default Gallery;
