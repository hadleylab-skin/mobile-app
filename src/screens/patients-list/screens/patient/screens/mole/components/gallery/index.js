import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
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

const Gallery = createReactClass({
    displayName: 'Gallery',

    propTypes: {
        currentImagePk: PropTypes.number,
        setcurrentImagePk: PropTypes.func.isRequired,
        images: PropTypes.arrayOf(PropTypes.shape({
            photo: PropTypes.shape({
                fullSize: PropTypes.string,
                thumbnail: PropTypes.string,
            }),
            dateCreated: PropTypes.string,
        })).isRequired,
    },

    contextTypes: {},

    shouldComponentUpdate(nextProps) {
        if (nextProps !== this.props) {
            return true;
        }

        return false;
    },

    formateDate(date) {
        const formatedDate = moment(date).format('MMMM D, YYYY hh:mm a');

        return formatedDate;
    },

    renderActivityIndicator(size) {
        return (
            <View style={s.activityIndicator}>
                <ActivityIndicator
                    animating
                    size={size}
                    color="#FF1D70"
                />
            </View>
        );
    },

    render() {
        const { currentImagePk, setcurrentImagePk } = this.props;
        const { width } = Dimensions.get('window');

        return (
            <View style={s.container}>
                <View style={s.carousel}>
                    <Carousel
                        ref={(ref) => { this.carousel = ref; }}
                        sliderWidth={width}
                        itemWidth={width}
                        inactiveSlideScale={1}
                        scrollEventThrottle={100}
                        onSnapToItem={(id) => {
                            const image = this.props.images[id];
                            setcurrentImagePk(image.data.pk);
                        }}
                    >
                        {_.map(this.props.images, (image, index) => (
                            <View style={s.galleryItem} key={`gallery-image-${index}`}>
                                {this.renderActivityIndicator('large')}
                                {!_.isEmpty(image.data) && image.data.dateCreated ?
                                    <View>
                                        <View style={s.dateWrraper}>
                                            <Text style={s.date}>
                                                {`uploaded: ${this.formateDate(image.data.dateCreated)}`}
                                            </Text>
                                        </View>
                                        <Image source={{ uri: image.data.photo.fullSize }} style={s.galleryImage} />
                                    </View>
                                : <View style={s.galleryImage} />}
                            </View>
                        ))}
                    </Carousel>
                    <View style={s.dots}>
                        {_.map(this.props.images, (dot, index) => (
                            <View
                                style={[s.dot, currentImagePk === dot.data.pk ? s.activeDot : {}]}
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
                                        currentImagePk === thumb.data.pk ? s.activeThumb : {}]}
                                >
                                    {this.renderActivityIndicator('small')}
                                    {!_.isEmpty(thumb.data) && thumb.data.dateCreated ?
                                        <Image source={{ uri: thumb.data.photo.thumbnail }} style={s.thumb} />
                                    : null}
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
