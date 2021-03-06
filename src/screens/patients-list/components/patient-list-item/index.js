import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    Text,
    View,
    Image,
    Alert,
    TouchableWithoutFeedback,
} from 'react-native';
import moment from 'moment';
import { checkConsent } from 'screens/signature';
import { isStudyConsentExpired } from 'libs/misc';
import { getAnatomicalSiteWidgetRoute } from 'screens/anatomical-site-widget';
import { getPatientRoute } from '../../screens/patient';
import s from './styles';

const PatientListItem = createReactClass({
    displayName: 'PatientListItem',

    propTypes: {
        navigator: PropTypes.object.isRequired, // eslint-disable-line
        data: PropTypes.shape({
            pk: PropTypes.number,
            firstName: PropTypes.string,
            lastName: PropTypes.string,
            molesImagesCount: PropTypes.number,
            photo: PropTypes.shape({
                thumbnail: PropTypes.string,
            }),
            lastUpload: PropTypes.string,
            hidden: PropTypes.bool,
        }).isRequired,
        goToWidgetCursor: BaobabPropTypes.cursor.isRequired,
        onAddingComplete: PropTypes.func.isRequired,
        studiesCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired, // eslint-disable-line
        cursors: PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
        }),
        services: PropTypes.shape({
            getPatientMolesService: PropTypes.func.isRequired,
            updatePatientConsentService: PropTypes.func.isRequired,
        }),
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

            return false;
        }

        return checkConsent(
            cursors.patients.data.select(this.props.data.pk).data,
            services.updatePatientConsentService,
            mainNavigator);
    },

    render() {
        const { cursors, services, mainNavigator } = this.context;
        const { firstName, lastName, lastUpload, photo, pk, hidden } = this.props.data;
        const totalImages = this.props.data.molesImagesCount;

        if (hidden) {
            return null;
        }

        return (
            <View style={s.container}>
                <TouchableWithoutFeedback
                    onPress={async () => {
                        cursors.currentPatientPk.set(pk);

                        if (this.props.goToWidgetCursor.get()) {
                            this.props.goToWidgetCursor.set(false);
                            let isConsentValid = await this.checkConsent();
                            if (isConsentValid) {
                                mainNavigator.push(
                                    getAnatomicalSiteWidgetRoute({
                                        tree: cursors.patientsMoles.select(pk, 'widgetData'),
                                        onAddingComplete: this.props.onAddingComplete,
                                    }, this.context)
                                );

                                await services.getPatientMolesService(
                                    pk,
                                    cursors.patientsMoles.select(pk, 'moles'),
                                    cursors.currentStudyPk.get('data'));
                            }

                            return;
                        }

                        this.props.navigator.push(
                            getPatientRoute({
                                tree: cursors.patientsMoles.select(pk),
                                navigator: this.props.navigator,
                                patientCursor: cursors.patients.select('data', pk),
                                onAddingComplete: this.props.onAddingComplete,
                                studiesCursor: this.props.studiesCursor,
                            }, this.context)
                        );
                    }}
                >
                    <View style={s.inner}>
                        {!_.isEmpty(photo) ?
                            <View style={s.photoWrapper}>
                                <Image
                                    source={{ uri: photo.thumbnail }}
                                    style={s.photo}
                                />
                            </View>
                        : null}
                        <View style={s.info}>
                            <Text style={s.name}>
                                {`${firstName} ${lastName}`}
                            </Text>
                            <Text style={s.text}>
                                <Text>
                                    {totalImages} photos
                                </Text>
                                {lastUpload ?
                                    <Text>
                                        , last upload: {moment(lastUpload).fromNow()}
                                    </Text>
                                : null}
                            </Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <View style={s.border} />
            </View>
        );
    },
});

export default PatientListItem;
