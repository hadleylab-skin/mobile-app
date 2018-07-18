import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import _ from 'lodash';
import {
    View,
    Text,
    Image,
    Alert,
    TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import schema from 'libs/state';
import { getSignatureRoute } from 'screens/signature';
import defaultUserImage from 'components/icons/empty-photo/empty-photo.png';
import { getConsentDocsScreenRoute } from 'screens/consent-docs';
import s from './styles';


const model = {
    tree: {
        signConsentScreen: {},
    },
};


export const GeneralInfo = schema(model)(createReactClass({
    propTypes: {
        patientCursor: BaobabPropTypes.cursor.isRequired,
        studiesCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired,
        services: PropTypes.shape({
            updatePatientConsentService: PropTypes.func.isRequired,
        }),
        cursors: PropTypes.shape({
            currentStudyPk: BaobabPropTypes.cursor.isRequired,
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

    goToStudySignature() {
        const currentStudyPk = this.context.cursors.currentStudyPk.get('data');
        const selectedStudy = _.find(
            this.props.studiesCursor.get('data'),
            (study) => study.pk === currentStudyPk);

        this.context.mainNavigator.push(
            getConsentDocsScreenRoute({
                study: selectedStudy,
                tree: this.props.tree.signConsentScreen,
                onSign: this.onSign,
            }, this.context)
        );
    },

    async onSign(signatureData) {
        const { pk } = this.props.patientCursor.get();
        const currentStudyPk = this.context.cursors.currentStudyPk.get('data');

        const result = await this.context.services.addStudyConsentService(
            currentStudyPk,
            this.props.tree.signConsentScreen,
            {
                patientPk: pk,
                signature: signatureData.encoded,
            },
        );

        if (result.status === 'Succeed') {
            await this.context.services.getStudiesService(this.props.studiesCursor);
            this.context.mainNavigator.popToTop();
        } else {
            Alert.alert('Error', JSON.stringify(result.error.data));
        }
    },

    render() {
        const { pk, dateOfBirth, photo, sex, mrn, validConsent } = this.props.patientCursor.get();
        const isConsetValid = moment(_.get(validConsent, 'data.dateExpired')) > moment();

        const studies = this.props.studiesCursor.get('data');
        const currentStudyPk = this.context.cursors.currentStudyPk.get('data');
        const study = _.find(studies, (item) => item.pk === currentStudyPk);
        let isStudyConsentValid = true;
        let studyConsentExpired = null;
        if (study && study.patientsConsents && study.patientsConsents[pk]) {
            studyConsentExpired = moment(study.patientsConsents[pk].dateExpired);
            isStudyConsentValid = studyConsentExpired > moment();
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
                        {studyConsentExpired ?
                            <View>
                                <View>
                                    <Text style={[s.text, isStudyConsentValid ? {} : { color: '#FC3159' }]}>
                                        {
                                            isStudyConsentValid
                                            ?
                                            `study consent till ${studyConsentExpired.format('DD/MMM/YYYY')}`
                                            :
                                            'study consent expired'
                                        }
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={this.goToStudySignature}
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
