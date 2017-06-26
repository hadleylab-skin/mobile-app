import React from 'react';
import _ from 'lodash';
import {
    View,
    Text,
    Image,
} from 'react-native';
import moment from 'moment';
import defaultUserImage from 'components/icons/empty-photo/empty-photo.png';
import s from './styles';

export const GeneralInfo = React.createClass({
    propTypes: {
        patientData: React.PropTypes.shape({
            dateOfBirth: React.PropTypes.string,
            photo: React.PropTypes.shape({
                thumbnail: React.PropTypes.string,
            }),
            sex: React.PropTypes.string,
            mrn: React.PropTypes.string,
            validConsent: React.PropTypes.string,
        }).isRequired,
    },

    render() {
        const { dateOfBirth, photo, sex, mrn, validConsent } = this.props.patientData;

        return (
            <View style={s.container}>
                <View style={s.photoWrapper}>
                    <Image
                        style={s.photo}
                        source={!_.isEmpty(photo) ? { uri: photo.thumbnail } : defaultUserImage}
                    />
                </View>
                <View>
                    {dateOfBirth ?
                        <View><Text style={s.text}>
                            {moment(dateOfBirth).format('DD/MMM/YYYY')}
                            {' '}
                            ({moment(dateOfBirth).fromNow(true)})
                            {', '}
                            {_.capitalize(sex)}
                        </Text></View>
                    : null}
                    {mrn ?
                        <View><Text style={s.text}>Medical #{mrn}</Text></View>
                    : null}
                    <View>
                        <View><Text style={s.text}>
                            {moment(validConsent.dateExpired) > moment() ?
                                `consent valid till ${moment(validConsent.dateExpired).format('DD/MMM/YYYY')}`
                            :
                                'consent expired'
                            }
                        </Text></View>
                        <View><Text style={[s.text, s.textDark]}>Update consent</Text></View>
                    </View>
                </View>
            </View>
        );
    },
});
