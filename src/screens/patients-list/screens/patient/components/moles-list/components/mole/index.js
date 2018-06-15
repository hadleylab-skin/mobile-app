import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
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

export const Mole = createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        checkConsent: PropTypes.func.isRequired,
        hasBorder: PropTypes.bool,
        navigator: PropTypes.object.isRequired, // eslint-disable-line
    },

    contextTypes: {
        cursors: PropTypes.shape({
            doctor: BaobabPropTypes.cursor.isRequired,
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            currentStudyPk: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
            patientsMoleImages: BaobabPropTypes.cursor.isRequired,
            filter: PropTypes.object.isRequired, // eslint-disable-line,
        }),
        services: PropTypes.shape({
            addMolePhotoService: PropTypes.func.isRequired,
            getMolePhotoService: PropTypes.func.isRequired,
            patientsService: PropTypes.func.isRequired,
            getPatientMolesService: PropTypes.func.isRequired,
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
        const age = dateOfBirth ? parseInt(moment().diff(moment(dateOfBirth), 'years'), 10) : null;
        const currentStudyPk = cursors.currentStudyPk.get('data');
        const result = await service(patientPk, molePk, imagesCursor.select(pk), {
            uri,
            age,
            currentStudyPk,
        });

        if (result.status === 'Succeed') {
            imagesCursor.unset(pk);
            imagesCursor.select(result.data.pk).set({ data: { ...result.data }, status: 'Loading' });

            await services.patientsService(cursors.patients,
                cursors.filter.get(), cursors.currentStudyPk.get('data'));
            await services.getPatientMolesService(
                patientPk,
                cursors.patientsMoles.select(patientPk, 'moles'),
                currentStudyPk
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
            Alert.alert('Server error', JSON.stringify(result.error.data));
        }
    },

    onPress() {
        const { anatomicalSites, pk } = this.props.tree.get();
        const patientPk = this.context.cursors.currentPatientPk.get();
        const { isParticipant } = this.context.cursors.doctor.get();

        this.props.navigator.push(
            getMoleRoute({
                tree: this.context.cursors.patientsMoleImages.select(patientPk, 'moles', pk),
                checkConsent: this.props.checkConsent,
                title: anatomicalSites[anatomicalSites.length - 1].name,
                onSubmitMolePhoto: this.onSubmitMolePhoto,
                molePk: pk,
                navigator: this.props.navigator,
                isParticipant,
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
