import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import _ from 'lodash';
import {
    View,
    Text,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import schema from 'libs/state';
import { resetState } from 'libs/tree';
import defaultUserImage from 'components/icons/empty-photo/empty-photo.png';
import { InfoField, Switch, Title, Updater, Picker } from 'components';
import { getCryptoConfigurationRoute } from 'screens/crypto-config';
import { isInSharedMode } from 'services/keypair';
import { saveCurrentStudy } from 'services/async-storage';
import { getSiteJoinRequestRoute } from './screens/site-join-request';
import s from './styles';

const model = (props, context) => ({
    tree: {
        siteJoinRequestScreenState: {},
        studies: context.services.getStudiesService,
        studyPicker: {},
        selectedStudyPk: context.services.getSavedCurrentStudyService,
    },
});

export const DoctorProfile = schema(model)(React.createClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        doctorCursor: BaobabPropTypes.cursor.isRequired,
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired,
        siteJoinRequestCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        cursors: React.PropTypes.shape({
            patients: BaobabPropTypes.cursor.isRequired,
            currentStudyPk: BaobabPropTypes.cursor.isRequired,
        }),
        services: React.PropTypes.shape({
            getStudiesService: React.PropTypes.func.isRequired,
            updateDoctorService: React.PropTypes.func.isRequired,
            getDoctorService: React.PropTypes.func.isRequired,
            getSiteJoinRequestsService: React.PropTypes.func.isRequired,
            confirmSiteJoinRequestService: React.PropTypes.func.isRequired,
            patientsService: React.PropTypes.func.isRequired,
            getSavedCurrentStudyService: React.PropTypes.func.isRequired,
        }),
    },

    async componentWillMount() {
        this.props.tree.selectedStudyPk.on('update', this.onSelectedStudyUpdate);
        this.onSelectedStudyUpdate();
    },

    componentWillUnmount() {
        this.props.tree.selectedStudyPk.off('update', this.onSelectedStudyUpdate);
    },

    async onSelectedStudyUpdate() {
        const { cursors } = this.context;
        const studyPk = this.props.tree.selectedStudyPk.get('data');
        if (_.isUndefined(studyPk)) {
            return;
        }

        if (studyPk) {
            cursors.filter.set('study', studyPk);
        } else {
            cursors.filter.unset('study');
        }

        this.context.cursors.currentStudyPk.set(studyPk);
        saveCurrentStudy(studyPk);
    },

    openCryptoConfiguration() {
        this.context.mainNavigator.push(
            getCryptoConfigurationRoute({
                doctorCursor: this.props.doctorCursor,
                keyPairStatusCursor: this.props.keyPairStatusCursor,
            }));
    },

    openSiteJoinRequests() {
        this.context.mainNavigator.push(
            getSiteJoinRequestRoute({
                tree: this.props.tree.siteJoinRequestScreenState,
                doctorPk: this.props.doctorCursor.get('data', 'pk'),
                siteJoinRequestCursor: this.props.siteJoinRequestCursor,
                afterRequestSended: this.afterSiteJoinRequestSended,
            }));
    },

    async updateScreenData() {
        let result = await this.context.services.getDoctorService(
            this.props.doctorCursor);
        if (result.status !== 'Succeed') {
            return result;
        }
        return this.context.services.getSiteJoinRequestsService(
            this.props.siteJoinRequestCursor);
    },

    async onUnitsOfLengthChange(unit) {
        const service = this.context.services.updateDoctorService;
        const unitsOfLengthCursor = this.props.doctorCursor.select('data', 'unitsOfLength');

        if (unit === unitsOfLengthCursor.get()) {
            return;
        }

        unitsOfLengthCursor.set(unit);
        await service(this.props.doctorCursor, { unitsOfLength: unit });
    },


    async afterSiteJoinRequestSended() {
        await this.context.services.getSiteJoinRequestsService(
            this.props.siteJoinRequestCursor);
    },

    async sharePatients() {
        const requestPk = _.get(
            _.values(this.props.siteJoinRequestCursor.data.get()),
            [0, 'data', 'pk']);

        if (typeof requestPk === 'undefined') {
            Alert.alert('Error', 'There is no requests to confirm');
            return;
        }

        const cursor = this.props.siteJoinRequestCursor.data.select(requestPk);

        const keys = _.chain(this.context.cursors.patients.data.get())
                      .values()
                      .map((patient) => [patient.data.pk, patient.data.encryptedKey])
                      .fromPairs()
                      .value();

        const result = await this.context.services.confirmSiteJoinRequestService(
            cursor,
            requestPk,
            {
                keys,
                coordinatorPublicKey: cursor.get('data', 'coordinatorPublicKey'),
            }
        );

        if (result.status === 'Failure') {
            Alert.alert('Error', JSON.stringify(result.error.data));
            return;
        }

        await this.updateScreenData();
        await this.context.services.patientsService(
            this.context.cursors.patients, {});
    },

    renderSiteJoinRequest() {
        const { data, status } = this.props.siteJoinRequestCursor.get();
        const remoteRequest = _.get(_.values(data), 0);

        if (status === 'Loading' || _.get(remoteRequest, 'status') === 'Loading') {
            return (
                <ActivityIndicator style={s.infoMessage} />
            );
        }

        if (remoteRequest) {
            const request = remoteRequest.data;
            switch (request.state) {
            case 0:
                return (
                    <Text
                        style={s.infoMessage}
                    >
                        {`You request to join ${request.siteTitle} is pending coordinator's aprrove`}
                    </Text>
                );
            case 1:
                return (
                    <Text
                        style={s.infoMessage}
                    >
                        {`You request to join ${request.siteTitle} was rejected`}
                    </Text>
                );
            case 2:
                return (
                    <InfoField
                        title={
                            <Text>
                                <Text style={{ color: 'red' }}>! </Text>
                                {`Share patients with ${request.siteTitle} site`}
                                <Text style={{ color: 'red' }}> !</Text>
                            </Text>
                        }
                        hasNoBorder
                        onPress={this.sharePatients}
                    />
                );
            case 4:
                return (
                    <Text
                        style={s.infoMessage}
                    >
                        {`Your patinets are shared with ${request.siteTitle} site`}
                    </Text>
                );

            default:
                return null;
            }
        }

        return (
            <InfoField
                title="Create site join request"
                hasNoBorder
                onPress={this.openSiteJoinRequests}
            />
        );
    },

    render() {
        const { firstName, lastName, photo, degree, department } = this.props.doctorCursor.get('data');
        const studies = this.props.tree.studies.get();
        const studyOptions = _.flatten(
            [
                [[null, 'Not selected']],
                _.map(studies.data, (study) => [
                    study.pk,
                    study.title,
                ]),
            ]
        );

        return (
            <Updater
                service={this.updateScreenData}
                style={s.container}
                color="#ACB5BE"
                ref={(ref) => { this.scrollView = ref; }}
            >
                <View style={s.info}>
                    <View style={s.pinkBg} />
                    <Image
                        style={s.photo}
                        source={!_.isEmpty(photo) ? { uri: photo.thumbnail } : defaultUserImage}
                    />
                    <View style={s.name}>
                        <Text style={s.text}>
                            {`${firstName} ${lastName}`}
                            {degree ? `, ${degree}` : null}
                        </Text>
                    </View>
                    {department ?
                        <View>
                            <Text style={s.department}>{department}</Text>
                        </View>
                    : null}
                </View>
                <Title text={'SETTINGS'} />
                <View style={s.content}>
                    <InfoField
                        title={'Units of length'}
                        hasNoBorder
                        controls={
                            <Switch
                                cursor={this.props.doctorCursor.select('data', 'unitsOfLength')}
                                disabled={this.props.doctorCursor.get('status') === 'Loading'}
                                items={[
                                    { label: 'in', value: 'in' },
                                    { label: 'cm', value: 'cm' },
                                ]}
                                itemWidth={70}
                                onPress={this.onUnitsOfLengthChange}
                            />
                        }
                    />
                </View>
                <View style={s.content}>
                    <Picker
                        tree={this.props.tree.studyPicker}
                        cursor={this.props.tree.selectedStudyPk.select('data')}
                        items={studyOptions}
                        title="Study"
                        onPress={() => this.scrollView.scrollTo({ x: 0, y: 320, animated: true })}
                    />
                </View>
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
                <View style={s.content}>
                    {this.renderSiteJoinRequest()}
                </View>
                <View style={s.content}>
                    <InfoField
                        title={'Log out'}
                        hasNoBorder
                        onPress={resetState}
                    />
                </View>
            </Updater>
        );
    },
}));
