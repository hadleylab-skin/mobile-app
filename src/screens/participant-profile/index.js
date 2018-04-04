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
import { InfoField, Updater, Button, Picker } from 'components';
import { getInvitesScreenRoute, getInviteDetailScreenRoute } from './invites';
import { Mole } from '../../screens/patients-list/screens/patient/components/moles-list/components/mole';
import s from './styles';

const model = (props, context) => {
    return {
        tree: {
            studies: {},
            selectedStudyPk: null,
            studyPicker: {},
            invites: context.services.getInvitesService,
            moles: {},
        },
    }
};

export const ParticipantProfile = schema(model)(React.createClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
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
        }),
    },

    async loadStudies() {
        await this.context.services.getStudiesService(this.props.tree.studies);
        const studies = this.props.tree.studies.get();
        if (studies.status === 'Succeed') {
            const firstStudy = _.first(studies.data);
            if (firstStudy && !this.props.tree.selectedStudyPk.get()) {
                this.props.tree.selectedStudyPk.set(firstStudy.pk);
            }
        }
    },

    async componentWillMount() {
        const { cursors, services } = this.context;
        this.loadStudies();
        await services.patientsService(cursors.patients);
        this.props.tree.selectedStudyPk.on('update', this.onSelectedStudyUpdate);
        this.onSelectedStudyUpdate();
    },

    componentWillUnmount() {
        this.props.tree.selectedStudyPk.off('update', this.onSelectedStudyUpdate);
    },

    async onSelectedStudyUpdate() {
        const { cursors, services } = this.context;
        const currentPatientPk = cursors.currentPatientPk.get();

        cursors.currentStudyPk.set(this.props.tree.selectedStudyPk.get());

        const result = await services.getPatientMolesService(
            currentPatientPk,
            this.props.tree.moles);
        cursors.patientsMoles.select(currentPatientPk, 'moles').set(result);
    },

    goEditProfile() {
        // TODO
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

        const currentStudyPk = this.props.tree.selectedStudyPk.get();
        if (currentStudyPk) {
            moles = _.filter(moles.data, (mole) => mole.data.lastImage.study === currentStudyPk);
        } else {
            moles = moles.data;
        }

        if (_.isEmpty(moles)) {
            return (
                <Text style={[s.moleGroupHeader, s.noImagesMargin]}>
                    No images for selected study
                </Text>
            )
        }

        const groupedMolesData = _.groupBy(moles, (mole) => mole.data.anatomicalSites[0].pk);
        return _.map(groupedMolesData, (molesGroup, key) => (
            <View key={key}>
                <Text style={s.moleGroupHeader}>
                    {_.upperCase(key)}
                </Text>
                {_.map(molesGroup, (mole, index) => {
                    return (
                        <Mole
                            key={`${key}-${index}`}
                            checkConsent={() => true}
                            hasBorder={index !== 0}
                            navigator={this.context.mainNavigator}
                            tree={this.props.tree.moles.select('data', mole.data.pk, 'data')}
                        />
                    );
                })}
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
        const studiesForPicker = _.map(studies.data, (item) => (
            [item.pk, item.title]
        ));
        const patient = _.first(_.values(patients.data)).data;
        const { firstName, lastName, photo, dateOfBirth } = patient;
        const age = dateOfBirth ? parseInt(moment().diff(moment(dateOfBirth), 'years')) : null;
        const invites = this.props.tree.invites.data.get();

        return (
            <View style={s.container}>
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
                            onPress={this.goEditProfile} />
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
                                            invites: invites,
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
                            cursor={this.props.tree.selectedStudyPk}
                            items={studiesForPicker}
                            title="Studies"
                        />
                    : null}

                    <InfoField
                        title={'Images'}
                    />
                    {this.renderMoles()}

                    <InfoField
                        title={'Log out'}
                        onPress={resetState}
                    />
                </ScrollView>
            </View>
        );
    },
}));
