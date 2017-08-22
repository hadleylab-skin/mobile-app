import React from 'react';
import _ from 'lodash';
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
import { onScroll } from 'components/updater';
import { getAnatomicalSiteWidgetRoute } from 'screens/anatomical-site-widget';
import { getCreateOrEditPatientRoute } from 'screens/create-or-edit';
import PatientListItem from './components/patient-list-item';
import Filter from './components/filter';
import Search from './components/search';
import s from './styles';

const patientsToList = _.partialRight(
    _.sortBy, ['data.lastName', 'data.firstName']);

const PatientsListScreen = schema({})(React.createClass({
    propTypes: {
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
        onAddingComplete: React.PropTypes.func.isRequired,
        onPatientAdded: React.PropTypes.func.isRequired,
        searchCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        cursors: React.PropTypes.shape({
            patients: BaobabPropTypes.cursor.isRequired,
            filter: React.PropTypes.object.isRequired, // eslint-disable-line,
        }),
        services: React.PropTypes.shape({
            createPatientService: React.PropTypes.func.isRequired,
            patientsService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        const ds = new ListView.DataSource({ rowHasChanged(p1, p2) { return !_.isEqual(p1, p2); } });
        const patients = patientsToList(this.context.cursors.patients.data.get()) || [];
        return {
            ds: ds.cloneWithRows(patients),
            canUpdate: true,
            isLoading: false,
        };
    },

    async componentWillMount() {
        const { cursors, services } = this.context;
        const queryParams = cursors.filter.get();

        await services.patientsService(cursors.patients, queryParams);
        cursors.patients.on('update', this.updateDataStore);
    },

    componentWillUnmount() {
        this.context.cursors.patients.off('update', this.updateDataStore);
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

    render() {
        const { cursors, services, mainNavigator } = this.context;
        const status = cursors.patients.status.get();
        const showLoader = this.state.isLoading;
        const isSucced = status === 'Succeed';
        const queryParams = cursors.filter.get();

        const isListEmpty = isSucced && _.isEmpty(cursors.patients.get('data'));

        const _onScroll = onScroll(async () => await services.patientsService(cursors.patients, queryParams));

        return (
            <View style={[s.container, isListEmpty ? s.containerEmpty : {}]}>
                <View style={s.toolbar}>
                    <Filter />
                    <Search searchCursor={this.props.searchCursor} />
                </View>
                {showLoader || status === 'Loading' ?
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating
                            size="large"
                            color="#FF1D70"
                        />
                    </View>
                : null}
                {isListEmpty ?
                    <View style={s.emptyList}>
                        <Text style={s.title}>You don’t have any patients yet.</Text>
                        <View style={s.button}>
                            <Button
                                title="+ Add a new patient"
                                onPress={() => mainNavigator.push(
                                    getCreateOrEditPatientRoute({
                                        tree: this.props.tree.select('newPatient'),
                                        title: 'New Patient',
                                        service: services.createPatientService,
                                        onActionComplete: this.props.onPatientAdded,
                                    }, this.context)
                                )}
                            />
                        </View>
                    </View>
                :
                    <ListView
                        enableEmptySections
                        onScroll={_onScroll.bind(this)}
                        scrollEventThrottle={20}
                        automaticallyAdjustContentInsets={false}
                        style={{
                            marginBottom: 49,
                        }}
                        dataSource={this.state.ds}
                        renderRow={(rowData) => (
                            <PatientListItem
                                data={rowData.data}
                                navigator={this.props.navigator}
                                goToWidgetCursor={this.props.tree.select('goToWidget')}
                                onAddingComplete={this.props.onAddingComplete}
                            />
                        )}
                    />
                }
            </View>
        );
    },
}));

export const PatientsList = React.createClass({
    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        cursors: React.PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
            filter: React.PropTypes.object.isRequired, // eslint-disable-line,
        }),
        services: React.PropTypes.shape({
            createPatientService: React.PropTypes.func.isRequired,
            patientsService: React.PropTypes.func.isRequired,
            getPatientMolesService: React.PropTypes.func.isRequired,
        }),
    },

    async onAddingComplete() {
        const { cursors, services } = this.context;
        const patientPk = cursors.currentPatientPk.get();
        const queryParams = cursors.filter.get();

        await services.patientsService(cursors.patients, queryParams);
        await services.getPatientMolesService(
            patientPk,
            cursors.patientsMoles.select(patientPk, 'moles')
        );
    },

    async onPatientAdded(pk) {
        const { cursors, services, mainNavigator } = this.context;
        const queryParams = cursors.filter.get();

        cursors.currentPatientPk.set(pk);
        mainNavigator.push(
            getAnatomicalSiteWidgetRoute({
                tree: cursors.patientsMoles.select('data', pk, 'anatomicalSites'),
                onAddingComplete: this.onAddingComplete,
                onBackPress: () => mainNavigator.popToTop(),
            }, this.context)
        );

        await services.patientsService(cursors.patients, queryParams);
    },

    render() {
        return (
            <NavigatorIOS
                ref={(ref) => { this.navigator = ref; }}
                initialRoute={{
                    component: PatientsListScreen,
                    title: 'Patients',
                    rightButtonSystemIcon: 'add',
                    onRightButtonPress: () => this.context.mainNavigator.push(
                        getCreateOrEditPatientRoute({
                            tree: this.props.tree.select('newPatient'),
                            title: 'New Patient',
                            service: this.context.services.createPatientService,
                            onActionComplete: this.onPatientAdded,
                        }, this.context)
                    ),
                    navigationBarHidden: false,
                    tintColor: '#FF2D55',
                    passProps: {
                        onAddingComplete: this.onAddingComplete,
                        onPatientAdded: this.onPatientAdded,
                        ...this.props,
                    },
                }}
                style={{ flex: 1 }}
                barTintColor="#fff"
            />
        );
    },
});
