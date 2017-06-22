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
import s from './styles';

const patientsToList = _.partialRight(
    _.sortBy, ['data.lastName', 'data.firstName']);

const PatientsListScreen = schema({})(React.createClass({
    propTypes: {
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
        onAddingComplete: React.PropTypes.func.isRequired,
        onPatientAdded: React.PropTypes.func.isRequired,
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
            isLoading: false,
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

    render() {
        const status = this.context.patients.status.get();
        const showLoader = this.state.isLoading;
        const isSucced = status === 'Succeed';

        const isListEmpty = isSucced && _.isEmpty(this.context.patients.get('data'));

        const _onScroll = onScroll(async () => await this.context.services.patientsService(this.context.patients));

        return (
            <View style={[s.container, isListEmpty ? s.containerEmpty : {}]}>
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
                {isListEmpty ?
                    <View style={s.emptyList}>
                        <Text style={s.title}>You don’t have any patients yet.</Text>
                        <View style={s.button}>
                            <Button
                                title="+ Add a new patient"
                                onPress={() => this.context.mainNavigator.push(
                                    getCreateOrEditPatientRoute({
                                        tree: this.props.tree.select('newPatient'),
                                        title: 'New Patient',
                                        service: this.context.services.createPatientService,
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
        currentPatientPk: BaobabPropTypes.cursor.isRequired,
        patients: BaobabPropTypes.cursor.isRequired,
        patientsMoles: BaobabPropTypes.cursor.isRequired,
        services: React.PropTypes.shape({
            createPatientService: React.PropTypes.func.isRequired,
            patientsService: React.PropTypes.func.isRequired,
            getPatientMolesService: React.PropTypes.func.isRequired,
        }),
    },

    async onAddingComplete() {
        const patientPk = this.context.currentPatientPk.get();

        await this.context.services.patientsService(this.context.patients);
        await this.context.services.getPatientMolesService(
            patientPk,
            this.context.patientsMoles.select(patientPk, 'moles')
        );
    },

    async onPatientAdded(pk) {
        this.context.currentPatientPk.set(pk);
        this.context.mainNavigator.push(
            getAnatomicalSiteWidgetRoute({
                tree: this.context.patientsMoles.select('data', pk),
                onAddingComplete: this.onAddingComplete,
                onBackPress: () => this.context.mainNavigator.popToTop(),
            }, this.context)
        );

        await this.context.services.patientsService(this.context.patients);
    },

    render() {
        return (
            <NavigatorIOS
                ref={(ref) => { this.navigator = ref; }}
                initialRoute={{
                    component: PatientsListScreen,
                    passProps: {
                        onAddingComplete: this.onAddingComplete,
                        onPatientAdded: this.onPatientAdded,
                        ...this.props,
                    },
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
                }}
                style={{ flex: 1 }}
                barTintColor="#fff"
            />
        );
    },
});
