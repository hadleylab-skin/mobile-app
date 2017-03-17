import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    ListView,
    ActivityIndicator,
    NavigatorIOS,
} from 'react-native';
import schema from 'libs/state';
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

const model = (props, context) => (
    {
        tree: {
            patients: context.services.patientsService,
            newPatient: {},
        },
        patientsImagesCursor: {},
    }
);

const PatientsListScreen = schema(model)(React.createClass({
    propTypes: {
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
        changeCurrentPatient: React.PropTypes.func.isRequired,
        tree: BaobabPropTypes.cursor.isRequired,
        patientsImagesCursor: BaobabPropTypes.cursor.isRequired,
        racesList: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
        anatomicalSiteList: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
        currentPatientCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        services: React.PropTypes.shape({
            patientsService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        const ds = new ListView.DataSource({ rowHasChanged(p1, p2) { return !_.isEqual(p1, p2); } });
        const patients = patientsToList(this.props.tree.patients.data.get()) || [];
        return {
            ds: ds.cloneWithRows(patients),
            canUpdate: true,
        };
    },

    componentWillMount() {
        this.props.tree.patients.on('update', this.updateDataStore);
    },

    componentWillUnmount() {
        this.props.tree.patients.off('update', this.updateDataStore);
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

    setPatientGlobalFlag(flagName) {
        return (choosenPatientId) => {
            const patients = _.values(this.props.tree.patients.data.get()).map((patient) => {
                const patientId = patient.data.id;
                let flagSetter = {};
                flagSetter[flagName] = patientId === choosenPatientId;
                return { ...patient, ...flagSetter };
            });
            this.props.tree.patients.data.set(_.keyBy(patients, (patient) => patient.data.id));
        };
    },

    async onScroll(e) {
        const offset = e.nativeEvent.contentOffset.y;
        if (offset < -100 && this.state.canUpdate && this.props.tree.patients.status.get() !== 'Loading') {
            this.setState({ canUpdate: false });
            await this.context.services.patientsService(this.props.tree.patients);
        }
        if (offset > -70) {
            this.setState({ canUpdate: true });
        }
    },

    render() {
        const status = this.props.tree.patients.status.get();
        const showLoader = status === 'Loading';
        const selectedPatientPk = this.props.currentPatientCursor.get('id');
        /* We can't send selectedPatientPk via props
         * this code
         * main/index.js:103
         * 100          }}
         * 101          racesList={this.props.tree.racesList.get('data') || []}
         * 102          anatomicalSiteList={this.props.tree.anatomicalSiteList.get('data') || []}
         * 103 -       currentPatientCursor={currentPatientCursor}
         * 103 +       selectedPatientPk={currentPatientCursor.get(lid)}
         * 104     />
         * 105 </TabBarIOS.Item>
         * will not work.
         *  It is related with render optimization.
         *  Maybe the problem is
         *  https://github.com/facebook/react-native/blob/c92ad5f6ae74c1d398c7cd93d5c4c50da0ca0430/Libraries/Components/TabBarIOS/TabBarItemIOS.ios.js#L121
         * I leave cursor here, maybe it will be refactored later
         */

        return (
            <View style={{ flex: 1 }}>
                { showLoader ?
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating={showLoader}
                            size="large"
                            color="#FF2D55"
                        />
                    </View>
                :
                    null
                }
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
                            tree={this.props.patientsImagesCursor.select(rowData.data.id)}
                            data={rowData.data}
                            isActive={rowData.isActive || false}
                            isSelected={rowData.isSelected || false}
                            changeCurrentPatient={(patient, switchTab) => {
                                this.props.changeCurrentPatient(patient, switchTab);
                                this.setPatientGlobalFlag('isActive')(rowData.data.id);
                            }}
                            showPatientSelectButton={this.setPatientGlobalFlag('isSelected')}
                            patientCursor={this.props.tree.patients.data.select(rowData.data.id)}
                            selectedPatientPk={selectedPatientPk}
                            navigator={this.props.navigator}
                            racesList={this.props.racesList}
                            anatomicalSiteList={this.props.anatomicalSiteList}
                        />
                    )}
                />
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
                    rightButtonTitle: 'Create',
                    onRightButtonPress: () => this.context.mainNavigator.push(getRoute(this.props, this.context)),
                    navigationBarHidden: false,
                    tintColor: '#FF2D55',
                }}
                style={{ flex: 1 }}
            />
        );
    },
});
