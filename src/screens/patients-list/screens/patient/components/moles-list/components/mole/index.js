import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
} from 'react-native';
import moment from 'moment';
import arrowImage from 'components/icons/arrow/arrow.png';
import { getMoleRoute } from 'screens/patients-list/screens/patient/screens/mole';
import s from './styles';

export const Mole = React.createClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        checkConsent: React.PropTypes.func.isRequired,
        hasBorder: React.PropTypes.bool,
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    contextTypes: {
        cursors: React.PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
            patientsMoleImages: BaobabPropTypes.cursor.isRequired,
            filter: React.PropTypes.object.isRequired, // eslint-disable-line,
        }),
        services: React.PropTypes.shape({
            addMolePhotoService: React.PropTypes.func.isRequired,
            getMolePhotoService: React.PropTypes.func.isRequired,
            patientsService: React.PropTypes.func.isRequired,
            getPatientMolesService: React.PropTypes.func.isRequired,
        }),
    },

    formatDate(date) {
        const todayDate = moment().startOf('second');
        const newDate = moment(date);

        const daysAgo = Math.round(moment.duration(todayDate - newDate).asDays());

        if (daysAgo > 7) {
            return newDate.format('MMMM Do YYYY');
        }

        return newDate.from(todayDate);
    },

    getNotExistingPk(pk) {
        const molePk = this.props.tree.get('pk');
        const patientPk = this.context.cursors.currentPatientPk.get();
        const moleCursor = this.context.cursors.patientsMoleImages.select(patientPk, 'moles', molePk);
        const images = moleCursor.get('data', 'images');

        if (!images[pk]) {
            return pk;
        }

        return this.getNotExistingPk(pk - 1);
    },

    async onSubmitMolePhoto(uri) {
        const { cursors, services } = this.context;
        const molePk = this.props.tree.get('pk');
        const service = services.addMolePhotoService;
        const patientPk = cursors.currentPatientPk.get();
        const moleCursor = cursors.patientsMoleImages.select(patientPk, 'moles', molePk);
        const imagesCursor = moleCursor.select('data', 'images');

        const pk = this.getNotExistingPk(-1);
        imagesCursor.select(pk).set({ data: { pk }, status: 'Loading' });

        const dateOfBirth = this.context.cursors.patients.data.select(
            this.context.cursors.currentPatientPk.get()).data.dateOfBirth.get();
        const age = dateOfBirth ? parseInt(moment(dateOfBirth).fromNow(true)) : null;
        // TODO use timedelat insted of fromNow
        const result = await service(patientPk, molePk, imagesCursor.select(pk), { uri, age });

        if (result.status === 'Succeed') {
            const queryParams = cursors.filter.get();

            imagesCursor.unset(pk);
            imagesCursor.select(result.data.pk).set({ data: { ...result.data }, status: 'Loading' });

            await services.patientsService(cursors.patients, queryParams);
            await services.getPatientMolesService(
                patientPk,
                cursors.patientsMoles.select(patientPk, 'moles')
            );
            await services.getMolePhotoService(
                patientPk,
                molePk,
                result.data.pk,
                imagesCursor.select(result.data.pk)
            );
        }

        if (result.status === 'Failure') {
            imagesCursor.unset(pk);
            Alert.alert('Server error', JSON.stringify(result.error));
        }
    },

    onPress() {
        const { anatomicalSites, pk } = this.props.tree.get();
        const patientPk = this.context.cursors.currentPatientPk.get();

        this.props.navigator.push(
            getMoleRoute({
                tree: this.context.cursors.patientsMoleImages.select(patientPk, 'moles', pk),
                checkConsent: this.props.checkConsent,
                title: anatomicalSites[anatomicalSites.length - 1].name,
                onSubmitMolePhoto: this.onSubmitMolePhoto,
                molePk: pk,
                navigator: this.props.navigator,
            })
        );
    },

    render() {
        const { hasBorder } = this.props;
        const { lastImage, imagesCount, anatomicalSites } = this.props.tree.get();

        if (_.isEmpty(lastImage)) {
            return null;
        }

        const { clinicalDiagnosis, dateModified, photo } = lastImage;
        const isClinicalDiagnosisBad = false;

        return (
            <TouchableOpacity
                style={s.mole}
                onPress={this.onPress}
                activeOpacity={0.5}
            >
                {!_.isEmpty(photo) ?
                    <View style={s.photoWrapper}>
                        <Image source={{ uri: photo.thumbnail }} style={s.photo} />
                        {imagesCount > 1 ?
                            <Image source={{ uri: photo.thumbnail }} style={[s.photo, s.bottomPhoto]} />
                        : null}
                    </View>
                : null}
                <View style={s.infoWrapper}>
                    <View style={s.titleWrapper}>
                        <Text style={s.title}>
                            {_.capitalize(anatomicalSites[anatomicalSites.length - 1].name)}
                        </Text>
                    </View>
                    <View style={s.textWrapper}>
                        <Text style={s.text}>
                            {imagesCount}
                            {imagesCount === 1 ? ' image, ' : ' images, '}
                            last upload: {this.formatDate(dateModified)}
                        </Text>
                    </View>
                    {clinicalDiagnosis ?
                        <View style={s.textWrapper}>
                            <Text style={[s.text, isClinicalDiagnosisBad ? s.textRed : {}]}>
                                {clinicalDiagnosis}
                            </Text>
                        </View>
                    : null}
                </View>
                {hasBorder ? <View style={s.border} /> : null}
                <Image source={arrowImage} style={s.arrow} />
            </TouchableOpacity>
        );
    },
});
