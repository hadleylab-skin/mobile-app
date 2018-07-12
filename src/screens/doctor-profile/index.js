import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import _ from 'lodash';
import {
    View,
    Text,
    Image,
    ActivityIndicator,
    Alert,
    TouchableHighlight,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import schema from 'libs/state';
import { resetState } from 'libs/tree';
import defaultAvatarImage from 'components/icons/avatar/avatar.png';
import { InfoField, Switch, Title, Updater, Picker } from 'components';
import { getCryptoConfigurationRoute } from 'screens/crypto-config';
import { isInSharedMode } from 'services/keypair';
import { saveCurrentStudy } from 'services/async-storage';
import { getSiteJoinRequestRoute } from './screens/site-join-request';
import { getPatiensToApproveListRoute } from './screens/patients-to-approve';
import s from './styles';

const model = (props, context) => ({
    tree: {
        siteJoinRequestScreenState: {},
        studyPicker: {},
        cryptoConfigScreen: {},
        patientsToApprove: context.services.getPatientsWaitingForDoctorApproveService,
    },
});

export const DoctorProfile = schema(model)(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        studiesCursor: BaobabPropTypes.cursor.isRequired,
        doctorCursor: BaobabPropTypes.cursor.isRequired,
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired,
        siteJoinRequestCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired, // eslint-disable-line
        cursors: PropTypes.shape({
            patients: BaobabPropTypes.cursor.isRequired,
            currentStudyPk: BaobabPropTypes.cursor.isRequired,
        }),
        services: PropTypes.shape({
            getStudiesService: PropTypes.func.isRequired,
            updateDoctorService: PropTypes.func.isRequired,
            updateDoctorPhotoService: PropTypes.func.isRequired,
            getDoctorService: PropTypes.func.isRequired,
            getSiteJoinRequestsService: PropTypes.func.isRequired,
            confirmSiteJoinRequestService: PropTypes.func.isRequired,
            patientsService: PropTypes.func.isRequired,
            getPatientsWaitingForDoctorApproveService: PropTypes.func.isRequired,
        }),
    },

    async componentWillMount() {
        this.context.cursors.currentStudyPk.on('update', this.onSelectedStudyUpdate);
        this.onSelectedStudyUpdate();
    },

    componentWillUnmount() {
        this.context.cursors.currentStudyPk.off('update', this.onSelectedStudyUpdate);
    },

    async onSelectedStudyUpdate() {
        saveCurrentStudy(this.context.cursors.currentStudyPk.get('data'));
    },

    openCryptoConfiguration() {
        this.context.mainNavigator.push(
            getCryptoConfigurationRoute({
                doctorCursor: this.props.doctorCursor,
                keyPairStatusCursor: this.props.keyPairStatusCursor,
                tree: this.props.tree.cryptoConfigScreen,
            })
        );
    },

    openPatiensToApproveList() {
        this.context.mainNavigator.push(
            getPatiensToApproveListRoute({
                tree: this.props.tree,
            })
        );
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

        result = await this.context.services.getStudiesService(
            this.props.studiesCursor);
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
        const { cursors, services } = this.context;
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
        await services.patientsService(cursors.patients,
            cursors.filter.get(), cursors.currentStudyPk.get('data'));
    },

    changePhoto() {
        ImagePicker.showImagePicker({},
            async (response) => {
                if (response.uri) {
                    await this.context.services.updateDoctorPhotoService(
                        this.props.doctorCursor, { photo: response.uri }
                    );
                }
            });
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
                        {`You request to join ${request.siteTitle} is pending coordinator's approval`}
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
                                {`Share patients data with ${request.siteTitle} site`}
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
                        {`Patient data is being shared with ${request.siteTitle} site`}
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
        const status = this.props.doctorCursor.get('status');
        const studies = this.props.studiesCursor.get();
        const studyOptions = _.flatten(
            [
                [[null, 'Not selected']],
                _.map(studies.data, (study) => [
                    study.pk,
                    study.title,
                ]),
            ]
        );

        const patientsToApprove = this.props.tree.patientsToApprove.get();
        const patientsToApproveAmount = 10;

        return (
            <Updater
                service={this.updateScreenData}
                style={s.container}
                color="#ACB5BE"
                ref={(ref) => { this.scrollView = ref; }}
            >
                { status === 'Loading' ?
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating
                            size="large"
                            color="#FF1D70"
                        />
                    </View>
                : null}
                <View style={s.info}>
                    <View style={s.pinkBg} />
                    <TouchableHighlight
                        underlayColor="#FF1D70"
                        onPress={this.changePhoto}>
                        <Image
                            style={s.photo}
                            source={!_.isEmpty(photo) ? { uri: photo.thumbnail } : defaultAvatarImage}
                        />
                    </TouchableHighlight>
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
                        cursor={this.context.cursors.currentStudyPk.select('data')}
                        items={studyOptions}
                        title="Study"
                        onPress={() => this.scrollView.scrollTo({ x: 0, y: 320, animated: true })}
                    />
                </View>
                {!isInSharedMode() ?
                    <View style={s.content}>
                        <InfoField
                            title="Cryptography configuration"
                            hasNoBorder
                            onPress={this.openCryptoConfiguration}
                        />
                    </View>
                : null}
                <View style={s.content}>
                    {this.renderSiteJoinRequest()}
                </View>
                <View style={s.content}>
                    <InfoField
                        title="Patients to approve"
                        hasNoBorder
                        onPress={this.openPatiensToApproveList}
                    />
                </View>
                <View style={s.content}>
                    <InfoField
                        title="Log out"
                        hasNoBorder
                        onPress={resetState}
                    />
                </View>
            </Updater>
        );
    },
}));
