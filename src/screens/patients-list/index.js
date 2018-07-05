import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import _ from 'lodash';
import moment from 'moment';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    SafeAreaView,
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
import { patientEmailRoute } from 'screens/patient-email';
import PatientListItem from './components/patient-list-item';
import Filter from './components/filter';
import Search from './components/search';
import s from './styles';

const PatientsListScreen = schema({})(createReactClass({
    propTypes: {
        navigator: PropTypes.object.isRequired, // eslint-disable-line
        onAddingComplete: PropTypes.func.isRequired,
        onPatientAdded: PropTypes.func.isRequired,
        searchCursor: BaobabPropTypes.cursor.isRequired,
        studiesCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired, // eslint-disable-line
        cursors: PropTypes.shape({
            patients: BaobabPropTypes.cursor.isRequired,
            filter: PropTypes.object.isRequired, // eslint-disable-line,
            currentStudyPk: BaobabPropTypes.cursor.isRequired,
        }),
        services: PropTypes.shape({
            createPatientService: PropTypes.func.isRequired,
            patientsService: PropTypes.func.isRequired,
            getStudiesService: PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        const ds = new ListView.DataSource({ rowHasChanged(p1, p2) { return !_.isEqual(p1, p2); } });
        const patients = this.patientsToList(this.context.cursors.patients.data.get()) || [];
        return {
            ds: ds.cloneWithRows(patients),
            canUpdate: true,
        };
    },

    async componentWillMount() {
        const { cursors } = this.context;

        cursors.patients.on('update', this.updateDataStore);
        cursors.currentStudyPk.on('update', this.updateCurrentStudy);

        this.updateCurrentStudy();
    },

    componentWillUnmount() {
        this.context.cursors.patients.off('update', this.updateDataStore);
        this.context.cursors.currentStudyPk.off('update', this.updateCurrentStudy);
    },

    patientsToList(data) {
        return _.partialRight(_.sortBy, ['data.lastName', 'data.firstName'])(data);
    },

    updateDataStore(event) {
        const data = event.data.currentData;
        if (data.status === 'Succeed') {
            const patients = this.patientsToList(data.data);

            this.setState({
                ds: this.state.ds.cloneWithRows(patients),
            });
        }
    },

    async updateCurrentStudy() {
        this.props.navigator.popToTop();

        const { cursors, services } = this.context;

        await services.patientsService(cursors.patients,
            cursors.filter.get(), cursors.currentStudyPk.get('data'));
    },

    renderList() {
        const { cursors, services } = this.context;
        const _onScroll = onScroll(async () => {
            let result = await services.patientsService(cursors.patients,
                cursors.filter.get(), cursors.currentStudyPk.get('data'));
            if (result.status !== 'Succeed') {
                return result;
            }

            result = await services.getStudiesService(this.props.studiesCursor);
            if (result.status !== 'Succeed') {
                return result;
            }

            return result;
        });

        return (
            <ListView
                enableEmptySections
                onScroll={_onScroll.bind(this)}
                scrollEventThrottle={20}
                automaticallyAdjustContentInsets={false}
                style={{
                    marginBottom: 49,
                    flex: 1,
                }}
                dataSource={this.state.ds}
                renderRow={(rowData) => (
                    <PatientListItem
                        data={rowData.data}
                        navigator={this.props.navigator}
                        goToWidgetCursor={this.props.tree.select('goToWidget')}
                        onAddingComplete={this.props.onAddingComplete}
                        studiesCursor={this.props.studiesCursor}
                    />
                )}
            />
        );
    },

    render() {
        const { cursors, services, mainNavigator } = this.context;
        const status = cursors.patients.status.get();
        const isListEmpty = status === 'Succeed' && _.isEmpty(cursors.patients.get('data'));

        return (
            <SafeAreaView style={[s.container, isListEmpty ? s.containerEmpty : {}]}>
                <View style={s.toolbar}>
                    <Filter />
                    <Search searchCursor={this.props.searchCursor} />
                </View>
                { status === 'Loading' ?
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
                        <Text style={s.title}>You don’t have any patients
                            yet.</Text>
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
                    this.renderList()
                }
            </SafeAreaView>
        );
    },
}));

export const PatientsList = createReactClass({
    contextTypes: {
        mainNavigator: PropTypes.object.isRequired, // eslint-disable-line
        cursors: PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
            filter: PropTypes.object.isRequired, // eslint-disable-line,
        }),
        services: PropTypes.shape({
            createPatientService: PropTypes.func.isRequired,
            patientsService: PropTypes.func.isRequired,
            getPatientMolesService: PropTypes.func.isRequired,
        }),
    },

    async onAddingComplete() {
        const { cursors, services } = this.context;
        const patientPk = cursors.currentPatientPk.get();

        await services.patientsService(cursors.patients,
            cursors.filter.get(), cursors.currentStudyPk.get('data'));
        const result = await services.getPatientMolesService(
            patientPk,
            cursors.patientsMoles.select(patientPk, 'moles'),
            cursors.currentStudyPk.get('data')
        );
        const status = result.status;

        return { status };
    },

    async onPatientAdded({ pk, sex, dateOfBirth }) {
        const { cursors, services, mainNavigator } = this.context;
        const isChild = parseInt(moment().diff(moment(dateOfBirth), 'years'), 10) <= 12;
        const modelSex = isChild ? 'c' : sex;

        cursors.currentPatientPk.set(pk);
        mainNavigator.push(
            getAnatomicalSiteWidgetRoute({
                tree: cursors.patientsMoles.select('data', pk, 'widgetData'),
                onAddingComplete: this.onAddingComplete,
                onBackPress: () => mainNavigator.popToTop(),
                sex: modelSex,
            }, this.context)
        );

        await services.patientsService(cursors.patients,
            cursors.filter.get(), cursors.currentStudyPk.get('data'));
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
                        patientEmailRoute({
                            tree: this.props.tree.select('patientEmail'),
                        }, this.context)
                        // getCreateOrEditPatientRoute({
                        //     tree: this.props.tree.select('newPatient'),
                        //     title: 'New Patient',
                        //     service: this.context.services.createPatientService,
                        //     onActionComplete: this.onPatientAdded,
                        // }, this.context)
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

