import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    Text,
    View,
    Image,
    TouchableWithoutFeedback,
} from 'react-native';
import moment from 'moment';
import { getAnatomicalSiteWidgetRoute } from 'screens/anatomical-site-widget';
import { getPatientRoute } from '../../screens/patient';
import { checkConsent } from 'screens/signature';
import s from './styles';

const PatientListItem = React.createClass({
    displayName: 'PatientListItem',

    propTypes: {
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
        data: React.PropTypes.shape({
            pk: React.PropTypes.number,
            firstName: React.PropTypes.string,
            lastName: React.PropTypes.string,
            molesImagesCount: React.PropTypes.number,
            photo: React.PropTypes.shape({
                thumbnail: React.PropTypes.string,
            }),
            lastUpload: React.PropTypes.string,
            hidden: React.PropTypes.bool,
        }).isRequired,
        goToWidgetCursor: BaobabPropTypes.cursor.isRequired,
        onAddingComplete: React.PropTypes.func.isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        cursors: React.PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
        }),
        services: React.PropTypes.shape({
            getPatientMolesService: React.PropTypes.func.isRequired,
            updatePatientConsentService: React.PropTypes.func.isRequired,
        }),
    },

    checkConsent() {
        return checkConsent(
            this.context.cursors.patients.data.select(this.props.data.pk).data,
            this.context.services.updatePatientConsentService,
            this.context.mainNavigator);
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
                                    cursors.currentStudyPk.get());
                            }

                            return;
                        }

                        this.props.navigator.push(
                            getPatientRoute({
                                tree: cursors.patientsMoles.select(pk),
                                navigator: this.props.navigator,
                                patientCursor: cursors.patients.select('data', pk),
                                onAddingComplete: this.props.onAddingComplete,
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
