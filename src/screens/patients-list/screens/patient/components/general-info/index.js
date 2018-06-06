import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
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

export const GeneralInfo = schema({})(createReactClass({
    propTypes: {
        patientCursor: BaobabPropTypes.cursor.isRequired,
        study: PropTypes.object.isRequired,  // eslint-disable-line
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired,
        services: PropTypes.shape({
            updatePatientConsentService: PropTypes.func.isRequired,
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
        const { pk, dateOfBirth, photo, sex, mrn, validConsent } = this.props.patientCursor.get();
        const isConsetValid = moment(_.get(validConsent, 'data.dateExpired')) > moment();

        const { study } = this.props;
        let isStudyConsentValid = true;
        let studyConsent = null;
        if (study && study.patientsConsents && study.patientsConsents[pk]) {
            studyConsent = study.patientsConsents[pk];
            isStudyConsentValid = moment(studyConsent.dateExpired) > moment();
        }

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
                        {studyConsent ?
                            <View>
                                <View>
                                    <Text style={[s.text, isStudyConsentValid ? {} : { color: '#FC3159' }]}>
                                        {
                                            isStudyConsentValid
                                            ?
                                            `study consent till ${moment(studyConsent.dateExpired).format('DD/MMM/YYYY')}`
                                            :
                                            'study consent expired'
                                        }
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={this.goToSignatireScreen}
                                >
                                    <Text style={[s.text, s.textDark]}>Update study consent</Text>
                                </TouchableOpacity>
                            </View>
                        : null}
                    </View>
                </View>
            </View>
        );
    },
}));
