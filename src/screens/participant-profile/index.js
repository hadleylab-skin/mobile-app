import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import _ from 'lodash';
import moment from 'moment';
import {
    View,
    Text,
    Image,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import schema from 'libs/state';
import { resetState } from 'libs/tree';
import defaultUserImage from 'components/icons/avatar-participant/avatar.png';
import { isStudyConsentExpired } from 'libs/misc';
import { getCreateOrEditPatientRoute } from 'screens/create-or-edit';
import { checkConsent } from 'screens/signature';
import { Mole } from 'screens/patients-list/screens/patient/components/moles-list/components/mole';
import { getConsentDocsScreenRoute } from 'screens/consent-docs';
import { InfoField, Updater, Button, Picker } from 'components';
import { getCryptoConfigurationRoute } from 'screens/crypto-config';
import { saveCurrentStudy } from 'services/async-storage';
import { isInSharedMode } from 'services/keypair';
import { getInvitesScreenRoute, getInviteDetailScreenRoute } from './invites';
import s from './styles';

const model = (props, context) => ({
    tree: {
        studyPicker: {},
        invites: context.services.getInvitesService,
        moles: {},
        editProfileScreen: {},
        cryptoConfigScreen: {},
        signConsentScreen: {},
    },
});

export const ParticipantProfile = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        studiesCursor: BaobabPropTypes.cursor.isRequired,
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired,
        doctorCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired, // eslint-disable-line
        cursors: PropTypes.shape({
            patients: BaobabPropTypes.cursor.isRequired,
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            currentStudyPk: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
        }),
        services: PropTypes.shape({
            patientsService: PropTypes.func.isRequired,
            getStudiesService: PropTypes.func.isRequired,
            addStudyConsentService: PropTypes.func.isRequired,
            getInvitesService: PropTypes.func.isRequired,
            getPatientMolesService: PropTypes.func.isRequired,
            updatePatientConsentService: PropTypes.func.isRequired,
            updatePatientService: PropTypes.func.isRequired,
        }),
    },

    componentWillMount() {
        this.context.cursors.currentStudyPk.on('update', this.onSelectedStudyUpdate);
        this.onSelectedStudyUpdate();
    },

    componentWillUnmount() {
        this.context.cursors.currentStudyPk.off('update', this.onSelectedStudyUpdate);
    },

    async onSelectedStudyUpdate() {
        const { cursors, services } = this.context;
        const currentPatientPk = cursors.currentPatientPk.get();
        const currentStudyPk = cursors.currentStudyPk.get('data');

        const result = await services.getPatientMolesService(
            currentPatientPk,
            this.props.tree.moles,
            currentStudyPk);
        cursors.patientsMoles.select(currentPatientPk, 'moles').set(result);
        saveCurrentStudy(currentStudyPk);
    },

    onCompleteSaveProfile(data) {
        const currentPatientPk = this.context.cursors.currentPatientPk.get();
        this.context.cursors.patients.select('data', currentPatientPk, 'data').set(data);
        this.context.mainNavigator.popToTop();
    },

    goEditProfile() {
        const { cursors, services } = this.context;
        const currentPatientPk = cursors.currentPatientPk.get();
        const doctor = { data: cursors.doctor };

        this.context.mainNavigator.push(
            getCreateOrEditPatientRoute({
                tree: this.props.tree.editProfileScreen,
                dataCursor: cursors.patients.select('data', currentPatientPk, 'data'),
                title: 'Edit Profile',
                service: (cursor, data) => services.updatePatientService(
                    currentPatientPk, cursor, data, null, doctor),
                onActionComplete: (data) => { this.onCompleteSaveProfile(data); },
            }, this.context)
        );
    },

    checkConsent() {
        const { cursors, services, mainNavigator } = this.context;
        const currentPatientPk = cursors.currentPatientPk.get();

        const studies = this.props.studiesCursor.get();
        const isStudyExpired = isStudyConsentExpired(
            studies.data,
            cursors.currentStudyPk.get('data'),
            currentPatientPk);
        if (isStudyExpired) {
            Alert.alert(
                'Study consent expired',
                'You need to re-sign study consent to add new images'
            );

            return;
        }

        return checkConsent(
            cursors.patients.select('data', currentPatientPk, 'data'),
            services.updatePatientConsentService,
            mainNavigator);
    },

    openUpdateStudyConsent() {
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
        const patients = this.context.cursors.patients.get();
        const patient = _.first(_.values(patients.data)).data;

        const result = await this.context.services.addStudyConsentService(
            this.context.cursors.currentStudyPk.get('data'),
            this.props.tree.signConsentScreen,
            {
                patientPk: patient.pk,
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

    openCryptoConfiguration() {
        this.context.mainNavigator.push(
            getCryptoConfigurationRoute({
                doctorCursor: this.props.doctorCursor,
                keyPairStatusCursor: this.props.keyPairStatusCursor,
                tree: this.props.tree.cryptoConfigScreen,
            }));
    },

    async onUpdateScreen() {
        let result = await this.context.services.getInvitesService(
            this.props.tree.invites,
        );
        if (result.status !== 'Succeed') {
            return result;
        }

        result = await this.context.services.getStudiesService(
            this.props.studiesCursor);
        if (result.status !== 'Succeed') {
            return result;
        }

        this.onSelectedStudyUpdate();
        return { status: 'Succeed' };
    },

    renderMoles() {
        let moles = this.props.tree.moles.get();

        if (_.isEmpty(moles) || moles.status === 'Loading') {
            return (
                <ActivityIndicator
                    animating
                    size="large"
                    color="#FF1D70"
                />
            );
        }

        if (_.isEmpty(moles)) {
            return (
                <Text style={[s.moleGroupHeader, s.noImagesMargin]}>
                    No images for selected study
                </Text>
            );
        }

        const groupedMolesData = _.groupBy(moles.data, (mole) => mole.data.anatomicalSites[0].pk);
        return _.map(groupedMolesData, (molesGroup, key) => (
            <View key={key}>
                <Text style={s.moleGroupHeader}>
                    {_.upperCase(key)}
                </Text>
                {_.map(molesGroup, (mole, index) => (
                    <Mole
                        key={`${key}-${index}`}
                        checkConsent={this.checkConsent}
                        hasBorder={index !== 0}
                        navigator={this.context.mainNavigator}
                        tree={this.props.tree.moles.select('data', mole.data.pk, 'data')}
                    />
                ))}
            </View>
        ));
    },

    render() {
        const patients = this.context.cursors.patients.get();
        if (patients.status === 'Loading') {
            return (
                <View style={s.container}>
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating
                            size="large"
                            color="#FF1D70"
                        />
                    </View>
                </View>
            );
        }

        const { studiesCursor } = this.props;
        const studies = studiesCursor.get();
        const studiesForPicker = _.flatten(
            [
                [[null, 'Not selected']],
                _.map(studies.data, (study) => [
                    study.pk,
                    study.title,
                ]),
            ]
        );
        const patient = _.first(_.values(patients.data)).data;
        const { firstName, lastName, dateOfBirth, photo } = patient;
        const age = dateOfBirth ? parseInt(moment().diff(moment(dateOfBirth), 'years'), 10) : null;
        const invites = this.props.tree.invites.data.get();

        const isStudyExpired = isStudyConsentExpired(
            studies.data,
            this.context.cursors.currentStudyPk.get('data'),
            patient.pk);

        const showInvitesFeild = invites && invites.length > 0;
        const showStudiesFeild = studiesForPicker.length > 0;

        return (
            <Updater
                service={this.onUpdateScreen}
                style={s.container}
            >
                <ScrollView
                    onScroll={this.onScroll}
                    style={s.inner}
                    ref={(ref) => { this.scrollView = ref; }}
                >
                    <View style={s.info}>
                        <Image
                            style={s.photo}
                            source={!_.isEmpty(photo) ? { uri: photo.thumbnail } : defaultUserImage}
                        />
                        <View>
                            <Text style={s.name_text}>
                                {`${firstName} ${lastName}`}
                            </Text>
                            {age ?
                                <Text style={s.age_text}>
                                    {age} years
                                </Text>
                            : null}
                        </View>
                    </View>

                    <View style={s.button}>
                        <Button
                            title="Edit profile"
                            onPress={this.goEditProfile}
                        />
                    </View>

                    <View style={s.fields}>
                        {showInvitesFeild ?
                            <InfoField
                                title={`${invites.length} pending invites`}
                                text={'>'}
                                hasNoBorder
                                onPress={() => {
                                    if (invites.length === 1) {
                                        this.context.mainNavigator.push(
                                            getInviteDetailScreenRoute({
                                                studiesCursor,
                                                invite: _.first(invites),
                                                tree: this.props.tree,
                                            }, this.context)
                                        );
                                    } else {
                                        this.context.mainNavigator.push(
                                            getInvitesScreenRoute({
                                                invites,
                                                studiesCursor,
                                                tree: this.props.tree,
                                            }, this.context)
                                        );
                                    }
                                }}
                            />
                        : null}

                        {showStudiesFeild ?
                            <Picker
                                tree={this.props.tree.studyPicker}
                                cursor={this.context.cursors.currentStudyPk.select('data')}
                                items={studiesForPicker}
                                title="Study"
                                hasNoBorder={!showInvitesFeild}
                            />
                        : null}

                        {isStudyExpired ?
                            <InfoField
                                title={
                                    <Text style={s.redText}>{'Consent update required!'}</Text>
                                }
                                onPress={this.openUpdateStudyConsent}
                                hasNoBorder={!showInvitesFeild && !showStudiesFeild}
                            />
                        : null}

                        <InfoField
                            title={'Images'}
                        />
                        {this.renderMoles()}

                        {!isInSharedMode() ?
                            <InfoField
                                title="Cryptography configuration"
                                onPress={this.openCryptoConfiguration}
                            />
                        : null}

                        <InfoField
                            title={'Log out'}
                            onPress={resetState}
                        />
                    </View>
                </ScrollView>
            </Updater>
        );
    },
}));
