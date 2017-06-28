import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import _ from 'lodash';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import schema from 'libs/state';
import { getSignatureRoute } from 'screens/signature';
import defaultUserImage from 'components/icons/empty-photo/empty-photo.png';
import s from './styles';

export const GeneralInfo = schema({})(React.createClass({
    propTypes: {
        patientCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired,
        services: React.PropTypes.shape({
            updatePatientConsentService: React.PropTypes.func.isRequired,
        }),
    },

    goToSignatireScreen() {
        this.context.mainNavigator.push(
            getSignatureRoute({
                navigator: this.context.mainNavigator,
                onSave: async (signatureData) => {
                    await this.context.services.updatePatientConsentService(
                        this.props.patientCursor.get('pk'),
                        this.props.patientCursor.validConsent,
                        signatureData.encoded,
                    );
                    this.context.mainNavigator.pop();
                },
            }));
    },

    render() {
        const { dateOfBirth, photo, sex, mrn, validConsent } = this.props.patientCursor.get();
        const isConsetValid = moment(_.get(validConsent, 'data.dateExpired')) > moment();

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
                        <View>
                            <Text style={[s.text, isConsetValid ? {} : { color: '#FC3159' }]}>
                                {
                                    isConsetValid
                                    ?
                                    `consent valid till ${moment(validConsent.data.dateExpired).format('DD/MMM/YYYY')}`
                                    :
                                    'consent expired'
                                }
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={this.goToSignatireScreen}
                        >
                            <Text style={[s.text, s.textDark]}>Update consent</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    },
}));
