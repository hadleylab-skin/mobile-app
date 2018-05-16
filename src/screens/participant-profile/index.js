import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import _ from 'lodash';
import moment from 'moment';
import {
    View,
    Text,
    Image,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import schema from 'libs/state';
import { resetState } from 'libs/tree';
import defaultUserImage from 'components/icons/empty-photo/empty-photo.png';
import { getCreateOrEditPatientRoute } from 'screens/create-or-edit';
import { checkConsent } from 'screens/signature';
import { InfoField, Updater, Button, Picker } from 'components';
import { getCryptoConfigurationRoute } from 'screens/crypto-config';
import { saveCurrentStudy } from 'services/async-storage';
import { getInvitesScreenRoute, getInviteDetailScreenRoute } from './invites';
import { Mole } from '../../screens/patients-list/screens/patient/components/moles-list/components/mole';
import { isInSharedMode } from 'services/keypair';
import s from './styles';

const model = (props, context) => ({
    tree: {
        studies: {},
        studyPicker: {},
        invites: context.services.getInvitesService,
        moles: {},
        editProfileScreen: {},
        cryptoConfigScreen: {},
    },
});

export const ParticipantProfile = schema(model)(React.createClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired,
        doctorCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        cursors: React.PropTypes.shape({
            patients: BaobabPropTypes.cursor.isRequired,
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            currentStudyPk: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
        }),
        services: React.PropTypes.shape({
            patientsService: React.PropTypes.func.isRequired,
            getStudiesService: React.PropTypes.func.isRequired,
            getInvitesService: React.PropTypes.func.isRequired,
            getPatientMolesService: React.PropTypes.func.isRequired,
            updatePatientConsentService: React.PropTypes.func.isRequired,
        }),
    },

    async componentWillMount() {
        await this.context.services.getStudiesService(this.props.tree.studies);
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
        const currentStudyPk = cursors.currentStudyPk.get();
        const doctor = { data: cursors.doctor };

        this.context.mainNavigator.push(
            getCreateOrEditPatientRoute({
                tree: this.props.tree.editProfileScreen,
                dataCursor: cursors.patients.select('data', currentPatientPk, 'data'),
                title: 'Edit Profile',
                service: (cursor, data) => services.updatePatientService(
                    currentPatientPk, cursor, data, currentStudyPk, doctor),
                onActionComplete: (data) => { this.onCompleteSaveProfile(data); },
            }, this.context)
        );
    },

    checkConsent() {
        const { cursors, services, mainNavigator } = this.context;
        const currentPatientPk = cursors.currentPatientPk.get();

        return checkConsent(
            cursors.patients.select('data', currentPatientPk, 'data'),
            services.updatePatientConsentService,
            mainNavigator);
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
        await this.context.services.getInvitesService(
            this.props.tree.invites,
        );
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

        const studies = this.props.tree.studies.get();
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
        const { firstName, lastName, dateOfBirth } = patient;
        const age = dateOfBirth ? parseInt(moment().diff(moment(dateOfBirth), 'years'), 10) : null;
        const invites = this.props.tree.invites.data.get();

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
                            source={defaultUserImage}
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

                    {invites && invites.length > 0 ?
                        <InfoField
                            title={`${invites.length} pending invites`}
                            text={'>'}
                            onPress={() => {
                                if (invites.length === 1) {
                                    this.context.mainNavigator.push(
                                        getInviteDetailScreenRoute({
                                            invite: _.first(invites),
                                            tree: this.props.tree,
                                        }, this.context)
                                    );
                                } else {
                                    this.context.mainNavigator.push(
                                        getInvitesScreenRoute({
                                            invites,
                                            tree: this.props.tree,
                                        }, this.context)
                                    );
                                }
                            }}
                        />
                    : null}

                    {studiesForPicker.length > 0 ?
                        <Picker
                            tree={this.props.tree.studyPicker}
                            cursor={this.context.cursors.currentStudyPk.select('data')}
                            items={studiesForPicker}
                            title="Studies"
                        />
                    : null}

                    <InfoField
                        title={'Images'}
                    />
                    {this.renderMoles()}

                    {
                    isInSharedMode()
                    ?
                    null
                    :
                    <View style={s.content}>
                        <InfoField
                            title="Cryptography configuration"
                            hasNoBorder
                            onPress={this.openCryptoConfiguration}
                        />
                    </View>
                    }

                    <InfoField
                        title={'Log out'}
                        onPress={resetState}
                    />
                </ScrollView>
            </Updater>
        );
    },
}));
