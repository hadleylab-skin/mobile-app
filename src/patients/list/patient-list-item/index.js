import React from 'react';
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

export default React.createClass({
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
        changeCurrentPatient: React.PropTypes.func.isRequired,
        activatePatient: React.PropTypes.func.isRequired,
        isPatientActiveInListView: React.PropTypes.bool.isRequired,
        patientImagesService: React.PropTypes.func.isRequired,
        imageService: React.PropTypes.func.isRequired,
    },

    onScroll(e) {
        const offset = e.nativeEvent.contentOffset.x;
        if (offset < 0 && !this.props.isPatientActiveInListView) {
            this.props.activatePatient(this.props.data.id);
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
        const { firstname, lastname, total_images, last_visit, id } = this.props.data;
        const { isPatientActiveInListView } = this.props;

        return (
            <View style={s.container}>
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    style={{ flex: 1 }}
                    contentOffset={isPatientActiveInListView ? {} : { x: 100 }}
                    onScroll={this.onScroll}
                    horizontal
                >
                    <TouchableHighlight
                        style={s.select}
                        underlayColor="#FF2D55"
                        onPress={() => {
                            this.setState({ activePatientId: 0 });
                            this.props.changeCurrentPatient(this.props.data, true);
                        }}
                    >
                        <Text style={s.selectText}>Select</Text>
                    </TouchableHighlight>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            this.props.changeCurrentPatient(this.props.data, false);
                            this.props.navigator.push({
                                component: Patient,
                                title: 'Patient',
                                onLeftButtonPress: () => this.props.navigator.pop(),
                                rightButtonTitle: 'Edit',
                                onRightButtonPress: () => this.props.navigator.push(getRoute(this.props, this.props.navigator)),
                                navigationBarHidden: false,
                                tintColor: '#FF2D55',
                                passProps: {
                                    tree: this.props.tree,
                                    id,
                                    firstname,
                                    lastname,
                                    navigator: this.props.navigator,
                                    patientImagesService: this.props.patientImagesService,
                                    imageService: this.props.imageService,
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
                                <Text style={[s.text, { fontSize: 18 }]}>
                                    {`${firstname} ${lastname}`}
                                </Text>
                                <Text style={[s.text, { opacity: 0.6 }]}>
                                    Images: {total_images}
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
