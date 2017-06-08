import React from 'react';
import _ from 'lodash';
import {
    View,
    Text,
    Image,
} from 'react-native';
import moment from 'moment';
import BaobabPropTypes from 'baobab-prop-types';
import defaultUserImage from 'components/icons/empty-photo/empty-photo.png';
import s from './styles';

export const GeneralInfo = React.createClass({
    propTypes: {
        dateOfBirth: React.PropTypes.string,
        photo: React.PropTypes.shape({
            thumbnail: React.PropTypes.string,
        }),
        sex: React.PropTypes.string,
        mrn: React.PropTypes.string,
        consentCursor: BaobabPropTypes.cursor.isRequired,
    },

    render() {
        const { dateOfBirth, photo, sex, mrn } = this.props;

        const consant = '2017-08-08';

        return (
            <View style={s.container}>
                <View style={s.photoWrapper}>
                    <Image
                        style={s.photo}
                        source={!_.isEmpty(photo) ? { uri: photo.thumbnail } : defaultUserImage}
                    />
                </View>
                <View>
                    <View><Text style={s.text}>
                        {moment(dateOfBirth).format('DD/MMM/YYYY')}
                        {' '}
                        ({moment(dateOfBirth).fromNow(true)})
                        {', '}
                        {_.capitalize(sex.substring(0, 1))}
                    </Text></View>
                    {mrn ?
                        <View><Text style={s.text}>Medical #{mrn}</Text></View>
                    : null}
                    {consant ?
                        <View><Text style={s.text}>
                            {moment(consant) > moment() ?
                                `consent valid till ${moment(consant).format('DD/MMM/YYYY')}`
                            :
                                'consent expired'
                            }
                        </Text></View>
                    : null}
                    <View><Text style={[s.text, s.textDark]}>Update consent</Text></View>
                </View>
            </View>
        );
    },
});
