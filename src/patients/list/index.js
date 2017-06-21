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
import { getAnatomicalSiteWidgetRoute } from 'components/anatomical-site-widget';
import PatientListItem from './patient-list-item';
import { getCreateOrEditPatientRoute } from '../create-or-edit';
import s from './styles';

function patientsToList(patients) {
    return _.chain(patients)
            .values()
            .reverse()
            .value();
}

const PatientsListScreen = schema({})(React.createClass({
    propTypes: {
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
        patientsMolesCursor: BaobabPropTypes.cursor.isRequired,
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
        if (offset <= -70 && this.state.canUpdate && this.context.patients.status.get() !== 'Loading') {
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

        const isListEmpty = isSucced && _.isEmpty(this.context.patients.get('data'));

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
                                        title: 'New Patient',
                                        service: this.context.services.createPatientService,
                                        tree: this.props.tree.select('newPatient'),
                                        onActionComplete: this.props.onPatientAdded,
                                    }, this.context)
                                )}
                            />
                        </View>
                    </View>
                :
                    <ListView
                        enableEmptySections
                        onScroll={this.onScroll}
                        scrollEventThrottle={20}
                        automaticallyAdjustContentInsets={false}
                        style={{
                            marginBottom: 49,
                        }}
                        dataSource={this.state.ds}
                        renderRow={(rowData) => (
                            <PatientListItem
                                tree={this.props.patientsMolesCursor.select(rowData.data.pk)}
                                data={rowData.data}
                                patientCursor={this.context.patients.select('data', rowData.data.pk)}
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
                            title: 'New Patient',
                            service: this.context.services.createPatientService,
                            tree: this.props.tree.select('newPatient'),
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
