import React from 'react';
import _ from 'lodash';
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

const model = (props) => (
    {
        tree: {
            patients: props.patientsService,
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
        patientsService: React.PropTypes.func.isRequired,
        patientImagesService: React.PropTypes.func.isRequired,
        getImageService: React.PropTypes.func.isRequired,
        updateImageService: React.PropTypes.func.isRequired,
        updatePatientService: React.PropTypes.func.isRequired,
        racesList: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
        anatomicalSiteList: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
        currentPatientCursor: BaobabPropTypes.cursor.isRequired,
    },

    getInitialState() {
        const ds = new ListView.DataSource({ rowHasChanged(p1, p2) { return !_.isEqual(p1, p2); } });
        const patients = this.props.tree.patients.data.get() || [];
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
            const patients = data.data;

            this.setState({
                ds: this.state.ds.cloneWithRows(patients),
            });
        }
    },

    activatePatient(activePatientId) {
        const patients = this.props.tree.patients.data.get().map((patient) => {
            const patientId = patient.data.id;
            return { ...patient, isActive: patientId === activePatientId };
        });

        this.props.tree.patients.data.set(patients);
    },

    showPatientOptions(selectedPatientId) {
        const patients = this.props.tree.patients.data.get().map((patient) => {
            const patientId = patient.data.id;
            return { ...patient, isSelected: patientId === selectedPatientId };
        });

        this.props.tree.patients.data.set(patients);
    },

    async onScroll(e) {
        const offset = e.nativeEvent.contentOffset.y;
        if (offset < -100 && this.state.canUpdate && this.props.tree.patients.status.get() !== 'Loading') {
            this.setState({ canUpdate: false });
            await this.props.patientsService(this.props.tree.patients);
        }
        if (offset > -70) {
            this.setState({ canUpdate: true });
        }
    },

    render() {
        const status = this.props.tree.patients.status.get();
        const showLoader = status === 'Loading';

        // currentPatientCursor.get('id') can't be recieved properly from parent.
        // It won't be updated in this case.
        const selectedPatientPk = this.props.currentPatientCursor.get('id');

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
                    renderRow={(rowData, sectionId, rowId) => (
                        <PatientListItem
                            tree={this.props.patientsImagesCursor.select(rowData.data.id)}
                            data={rowData.data}
                            isActive={rowData.isActive || false}
                            isSelected={rowData.isSelected || false}
                            changeCurrentPatient={(patient, switchTab) => {
                                this.props.changeCurrentPatient(patient, switchTab);
                                this.activatePatient(rowData.data.id);
                            }}
                            showPatientOptions={this.showPatientOptions}
                            patientCursor={this.props.tree.patients.data.select(rowId)}
                            selectedPatientPk={selectedPatientPk}
                            navigator={this.props.navigator}
                            patientImagesService={this.props.patientImagesService}
                            getImageService={this.props.getImageService}
                            updateImageService={this.props.updateImageService}
                            updatePatientService={this.props.updatePatientService}
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
    propTypes: {
        mainNavigator: React.PropTypes.func.isRequired,
    },

    render() {
        const mainNavigator = this.props.mainNavigator();

        return (
            <NavigatorIOS
                ref={(ref) => { this.navigator = ref; }}
                initialRoute={{
                    component: PatientsListScreen,
                    passProps: this.props,
                    title: 'Patients',
                    rightButtonTitle: 'Create',
                    onRightButtonPress: () => mainNavigator.push(getRoute(this.props, mainNavigator)),
                    navigationBarHidden: false,
                    tintColor: '#FF2D55',
                }}
                style={{ flex: 1 }}
            />
        );
    },
});
