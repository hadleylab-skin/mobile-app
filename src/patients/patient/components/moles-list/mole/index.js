import React from 'react';
import _ from 'lodash';
import {
    View,
    Text,
    Image,
} from 'react-native';
import moment from 'moment';
import s from './styles';

import arrowImage from './images/arrow.png';

export const Mole = React.createClass({
    propTypes: {
        hasBorder: React.PropTypes.bool,
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

    render() {
        const {
            images, title, dateModified,
            clinicalDiagnosis, isClinicalDiagnosisBad,
            hasBorder,
        } = this.props;

        return (
            <View style={s.mole}>
                <View style={s.photoWrapper}>
                    <Image source={images[0].photo} style={s.photo} />
                    {images.length > 1 ?
                        <Image source={images[1].photo} style={[s.photo, s.bottomPhoto]} />
                    : null}
                </View>
                <View>
                    <View style={s.titleWrapper}>
                        <Text style={s.title}>
                            {_.capitalize(title)}
                        </Text>
                    </View>
                    <View style={s.textWrapper}>
                        <Text style={s.text}>
                            {images.length}
                            {images.length === 1 ? ' image, ' : ' images, '}
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
            </View>
        );
    },
});
