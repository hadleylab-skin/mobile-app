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
import { getRoute } from '../../patient/edit-patient';
import Patient from '../../patient';
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
        patientCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        currentPatientPk: BaobabPropTypes.cursor.isRequired,
        services: React.PropTypes.shape({
            updatePatientService: React.PropTypes.func.isRequired,
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
        const { firstName, lastName, lastUpload, photo, pk } = this.props.data;
        const totalImages = this.props.data.molesImagesCount;

        return (
            <View style={s.container}>
                <TouchableWithoutFeedback
                    onPress={() => {
                        this.context.currentPatientPk.set(pk);
                        this.props.navigator.push({
                            component: Patient,
                            title: `${firstName} ${lastName}`,
                            onLeftButtonPress: () => this.props.navigator.pop(),
                            rightButtonTitle: 'Edit',
                            onRightButtonPress: () => this.props.navigator.push(
                                getRoute(this.props, this.context)),
                            navigationBarHidden: false,
                            tintColor: '#FF2D55',
                            passProps: {
                                tree: this.props.tree,
                                firstName,
                                lastName,
                                navigator: this.props.navigator,
                                patientCursor: this.props.patientCursor,
                            },
                        });
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
