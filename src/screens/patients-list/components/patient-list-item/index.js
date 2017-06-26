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
        }),
    },

    formatDate(date) {
        const year = moment(date).format('YYYY');
        const month = moment(date).format('M') - 1;
        const day = moment(date).format('DD');
        const hours = moment(date).format('H');
        const minutes = moment(date).format('m');
        const seconds = moment(date).format('s');
        const formatedDate = moment([year, month, day, hours, minutes, seconds]).fromNow();

        return formatedDate;
    },

    render() {
        const { cursors, services, mainNavigator } = this.context;
        const { firstName, lastName, lastUpload, photo, pk } = this.props.data;
        const totalImages = this.props.data.molesImagesCount;

        return (
            <View style={s.container}>
                <TouchableWithoutFeedback
                    onPress={async () => {
                        cursors.currentPatientPk.set(pk);

                        if (this.props.goToWidgetCursor.get()) {
                            this.props.goToWidgetCursor.set(false);
                            mainNavigator.push(
                                getAnatomicalSiteWidgetRoute({
                                    tree: cursors.patientsMoles.select(pk, 'anatomicalSites'),
                                    onAddingComplete: this.props.onAddingComplete,
                                }, this.context)
                            );

                            await services.getPatientMolesService(
                                pk, cursors.patientsMoles.select(pk, 'moles'));

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
                                        , last upload: {this.formatDate(lastUpload)}
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