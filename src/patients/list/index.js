import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    ListView,
    ActivityIndicator,
    NavigatorIOS,
} from 'react-native';
import schema from 'libs/state';
import { Button } from 'components';
import PatientListItem from './patient-list-item';
import { getRoute } from '../add';
import s from './styles';

function patientsToList(patients) {
    return _.chain(patients)
            .values()
            .sortBy((patient) => moment(patient.data.last_visit))
            .reverse()
            .value();
}

const PatientsListScreen = schema({})(React.createClass({
    propTypes: {
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
        patientsMolesCursor: BaobabPropTypes.cursor.isRequired,
        racesList: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        patients: BaobabPropTypes.cursor.isRequired,
        services: React.PropTypes.shape({
            createPatientService: React.PropTypes.func.isRequired,
            patientsService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        const ds = new ListView.DataSource({ rowHasChanged(p1, p2) { return !_.isEqual(p1, p2); } });
        const patients = patientsToList(this.context.patients.data.get()) || [];
        return {
            ds: ds.cloneWithRows(patients),
            canUpdate: true,
        };
    },

    async componentWillMount() {
        await this.context.services.patientsService(this.context.patients);
        this.context.patients.on('update', this.updateDataStore);
    },

    componentWillUnmount() {
        this.context.patients.off('update', this.updateDataStore);
    },

    updateDataStore(event) {
        const data = event.data.currentData;
        if (data.status === 'Succeed') {
            const patients = patientsToList(data.data);

            this.setState({
                ds: this.state.ds.cloneWithRows(patients),
            });
        }
    },

    async onScroll(e) {
        const offset = e.nativeEvent.contentOffset.y;
        if (offset < -100 && this.state.canUpdate && this.context.patients.status.get() !== 'Loading') {
            this.setState({ canUpdate: false });
            await this.context.services.patientsService(this.context.patients);
        }
        if (offset > -70) {
            this.setState({ canUpdate: true });
        }
    },

    render() {
        const status = this.context.patients.status.get();
        const showLoader = status === 'Loading';
        const isSucced = status === 'Succeed';

        return (
            <View style={s.container}>
                { showLoader ?
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating={showLoader}
                            size="large"
                            color="#FF1D70"
                        />
                    </View>
                :
                    null
                }
                {isSucced && _.isEmpty(this.context.patients.get('data')) ?
                    <View style={s.emptyList}>
                        <Text style={s.title}>You don’t have any patients yet.</Text>
                        <View style={s.button}>
                            <Button
                                title="+ Add a new patient"
                                onPress={() => this.context.mainNavigator.push(getRoute(this.props, this.context))}
                            />
                        </View>
                    </View>
                :
                    <View style={s.list}>
                        <ListView
                            enableEmptySections
                            onScroll={this.onScroll}
                            scrollEventThrottle={20}
                            style={{
                                paddingBottom: 49,
                            }}
                            dataSource={this.state.ds}
                            renderRow={(rowData) => (
                                <PatientListItem
                                    tree={this.props.patientsMolesCursor.select(rowData.data.pk)}
                                    data={rowData.data}
                                    patientCursor={this.context.patients.data.select(rowData.data.pk)}
                                    navigator={this.props.navigator}
                                    racesList={this.props.racesList}
                                />
                            )}
                        />
                    </View>
                }
            </View>
        );
    },
}));

export const PatientsList = React.createClass({
    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        services: React.PropTypes.shape({
            createPatientService: React.PropTypes.func.isRequired,
            patientsService: React.PropTypes.func.isRequired,
        }),
    },

    render() {
        return (
            <NavigatorIOS
                ref={(ref) => { this.navigator = ref; }}
                initialRoute={{
                    component: PatientsListScreen,
                    passProps: this.props,
                    title: 'Patients',
                    rightButtonSystemIcon: 'add',
                    onRightButtonPress: () => this.context.mainNavigator.push(getRoute(this.props, this.context)),
                    navigationBarHidden: false,
                    tintColor: '#FF2D55',
                }}
                style={{ flex: 1 }}
                barTintColor="#fff"
            />
        );
    },
});
