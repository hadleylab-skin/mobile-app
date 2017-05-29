import React from 'react';
import _ from 'lodash';
import {
    View,
    Text,
    Image,
} from 'react-native';
import moment from 'moment';
import BaobabPropTypes from 'baobab-prop-types';
import s from './styles';

import defaultUserImage from './images/default.png';

export const GeneralInfo = React.createClass({
    propTypes: {
        dob: React.PropTypes.string,
        profile_pic: React.PropTypes.object, // eslint-disable-line
        sex: React.PropTypes.string,
        mrn: React.PropTypes.string,
        consentCursor: BaobabPropTypes.cursor.isRequired,
    },

    render() {
        const { dob, profile_pic, sex, mrn } = this.props;

        const consant = '2017-08-08';

        return (
            <View style={s.container}>
                <View style={s.photoWrapper}>
                    <Image
                        source={profile_pic.thumbnail ? { uri: profile_pic.thumbnail } : defaultUserImage}
                        style={s.photo}
                    />
                </View>
                <View>
                    <View><Text style={s.text}>
                        {moment(dob).format('DD/MMM/YYYY')}
                        {' '}
                        ({moment(dob).fromNow(true)})
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
