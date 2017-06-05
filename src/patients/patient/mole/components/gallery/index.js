import React from 'react';
import _ from 'lodash';
import {
    View,
    Text,
    Dimensions,
    Image,
    ScrollView,
    TouchableWithoutFeedback,
} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import moment from 'moment';
import s from './styles';

import photo from './images/photo.png';

const galleryData = [
    {
        pk: 1,
        source: photo,
        date: '2017-04-06',
    },
    {
        pk: 2,
        source: photo,
        date: '2017-04-06',
    },
    {
        pk: 3,
        source: photo,
        date: '2017-04-06',
    },
    {
        pk: 4,
        source: photo,
        date: '2017-04-06',
    },
    {
        pk: 5,
        source: photo,
        date: '2017-04-06',
    },
];

const Gallery = React.createClass({
    displayName: 'Gallery',

    propTypes: {},

    contextTypes: {},

    getInitialState() {
        return {
            activeItem: 0,
        };
    },

    formateDate(date) {
        const formatedDate = moment(date).format('MMMM d, YYYY hh:mm a');

        return formatedDate;
    },

    render() {
        const { activeItem } = this.state;
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
                        onSnapToItem={(id) => this.setState({ activeItem: id })}
                    >
                        {_.map(galleryData, (image, index) => (
                            <View style={s.galleryItem} key={`gallery-image-${index}`}>
                                <View style={s.dateWrraper}>
                                    <Text style={s.date}>
                                        {`uploaded: ${this.formateDate(image.date)}`}
                                    </Text>
                                </View>
                                <Image source={image.source} style={s.galleryImage} />
                            </View>
                        ))}
                    </Carousel>
                    <View style={s.dots}>
                        {_.map(galleryData, (dot, index) => (
                            <View
                                style={[s.dot, activeItem === index ? s.activeDot : {}]}
                                key={`gallery-dot-${index}`}
                            />
                        ))}
                    </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={s.thumbs}>
                        {_.map(galleryData, (thumb, index) => (
                            <TouchableWithoutFeedback
                                onPress={() => this.carousel.snapToItem(index)}
                                key={`gallery-thumb-${index}`}
                            >
                                <View
                                    style={[s.thumbWrapper,
                                        activeItem === index ? s.activeThumb : {}]}
                                >
                                    <Image source={thumb.source} style={s.thumb} />
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
