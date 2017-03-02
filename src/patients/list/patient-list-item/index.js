import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    Text,
    View,
    Image,
    ScrollView,
    TouchableHighlight,
    TouchableWithoutFeedback,
} from 'react-native';
import moment from 'moment';
import { getRoute } from '../../patient/edit-patient';
import Patient from '../../patient';
import defaultUserImage from './images/default-user.png';
import s from './styles';

const PatientListItem = React.createClass({
    displayName: 'PatientListItem',

    propTypes: {
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
        data: React.PropTypes.shape({
            id: React.PropTypes.int,
            firstname: React.PropTypes.string,
            lastname: React.PropTypes.string,
            total_images: React.PropTypes.number,
            profile_pic: React.PropTypes.shape({
                thumbnail: React.PropTypes.string,
            }),
            last_visit: React.PropTypes.string,
        }).isRequired,
        isActive: React.PropTypes.bool,
        isSelected: React.PropTypes.bool,
        changeCurrentPatient: React.PropTypes.func.isRequired,
        anatomicalSiteList: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
        selectedPatientPk: React.PropTypes.number.isRequired,
        patientCursor: BaobabPropTypes.cursor.isRequired,
        showPatientOptions: React.PropTypes.func.isRequired,
    },

    contextTypes: {
        services: React.PropTypes.shape({
            updatePatientService: React.PropTypes.func.isRequired,
        }),
    },

    onScroll(e) {
        const offset = e.nativeEvent.contentOffset.x;
        if (offset < 0) {
            this.props.showPatientOptions(this.props.data.id);
            this.props.tree.isAdditionalMenuOpen.set(true);
        }
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
        const { firstname, lastname, last_visit, id } = this.props.data;
        const totalImages = this.props.data.total_images;
        const { isActive, selectedPatientPk } = this.props;

        return (
            <View style={s.container}>
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    style={{ flex: 1 }}
                    contentOffset={this.props.isSelected ? { x: 0 } : { x: 100 }}
                    onScroll={this.onScroll}
                    horizontal
                >
                    <TouchableHighlight
                        style={s.select}
                        underlayColor="#FF2D55"
                        onPress={() => {
                            this.props.changeCurrentPatient(this.props.data, true);
                            this.props.showPatientOptions(null);
                        }}
                    >
                        <Text style={s.selectText}>Select</Text>
                    </TouchableHighlight>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            this.props.changeCurrentPatient(this.props.data, false);
                            this.props.showPatientOptions(null);
                            this.props.navigator.push({
                                component: Patient,
                                title: 'Patient',
                                onLeftButtonPress: () => this.props.navigator.pop(),
                                rightButtonTitle: 'Edit',
                                onRightButtonPress: () => this.props.navigator.push(
                                    getRoute(this.props, this.context)),
                                navigationBarHidden: false,
                                tintColor: '#FF2D55',
                                passProps: {
                                    tree: this.props.tree,
                                    id,
                                    firstname,
                                    lastname,
                                    navigator: this.props.navigator,
                                    anatomicalSiteList: this.props.anatomicalSiteList,
                                    patientCursor: this.props.patientCursor,
                                },
                            });
                        }}
                    >
                        <View style={s.inner}>
                            <Image
                                source={defaultUserImage}
                                style={s.img}
                            />
                            <View style={s.info}>
                                <Text
                                    style={[s.text, {
                                        fontSize: 18,
                                        fontWeight: isActive || selectedPatientPk === id ? '700' : '400',
                                    }]}
                                >
                                    {`${firstname} ${lastname}`}
                                </Text>
                                <Text style={[s.text, { opacity: 0.6 }]}>
                                    Images: {totalImages}
                                </Text>
                                <Text style={[s.text, { opacity: 0.8 }]}>
                                    Last Upload: {this.formatDate(last_visit)}
                                </Text>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </View>
        );
    },
});

export default PatientListItem;
