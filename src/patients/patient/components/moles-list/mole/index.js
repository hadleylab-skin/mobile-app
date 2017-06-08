import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import ImagePicker from 'react-native-image-picker';
import arrowImage from 'components/icons/arrow/arrow.png';
import MoleScreen from '../../../mole';
import s from './styles';

export const Mole = React.createClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        hasBorder: React.PropTypes.bool,
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    formatDate(date) {
        const todayDate = moment().startOf('second');
        const newDate = moment(date);

        const daysAgo = Math.round(moment.duration(todayDate - newDate).asDays());

        if (daysAgo > 7) {
            return newDate.format('MMMM Do YYYY');
        }

        return newDate.from(todayDate);
    },

    onAddPhoto(uri) {},

    onPress() {
        const { anatomicalSites } = this.props.tree.get();

        this.props.navigator.push({
            component: MoleScreen,
            title: anatomicalSites[1].name,
            onLeftButtonPress: () => this.props.navigator.pop(),
            onRightButtonPress: () => ImagePicker.launchCamera({},
                (response) => this.onAddPhoto(response.uri)),
            navigationBarHidden: false,
            leftButtonIcon: require('components/icons/back/back.png'),
            rightButtonIcon: require('components/icons/camera/camera.png'),
            tintColor: '#FF2D55',
            passProps: {
                tree: this.props.tree,
            },
        });
    },

    render() {
        const { hasBorder } = this.props;
        const { lastImage, imagesCount, anatomicalSites } = this.props.tree.get();

        if (_.isEmpty(lastImage)) {
            return null;
        }

        const { clinicalDiagnosis, dateModified, photo } = lastImage;
        const isClinicalDiagnosisBad = false;

        return (
            <TouchableOpacity
                style={s.mole}
                onPress={this.onPress}
                activeOpacity={0.5}
            >
                {!_.isEmpty(photo) ?
                    <View style={s.photoWrapper}>
                        <Image source={{ uri: photo.thumbnail }} style={s.photo} />
                        {imagesCount > 1 ?
                            <Image source={{ uri: photo.thumbnail }} style={[s.photo, s.bottomPhoto]} />
                        : null}
                    </View>
                : null}
                <View>
                    <View style={s.titleWrapper}>
                        <Text style={s.title}>
                            {_.capitalize(anatomicalSites[1].name)}
                        </Text>
                    </View>
                    <View style={s.textWrapper}>
                        <Text style={s.text}>
                            {imagesCount}
                            {imagesCount === 1 ? ' image, ' : ' images, '}
                            last upload: {this.formatDate(dateModified)}
                        </Text>
                    </View>
                    {clinicalDiagnosis ?
                        <View style={s.textWrapper}>
                            <Text style={[s.text, isClinicalDiagnosisBad ? s.textRed : {}]}>
                                {clinicalDiagnosis}
                            </Text>
                        </View>
                    : null}
                </View>
                {hasBorder ? <View style={s.border} /> : null}
                <Image source={arrowImage} style={s.arrow} />
            </TouchableOpacity>
        );
    },
});
