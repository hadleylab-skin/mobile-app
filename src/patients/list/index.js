import React from 'react';
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
        patientService: React.PropTypes.func.isRequired,
        imageService: React.PropTypes.func.isRequired,
    },

    getInitialState() {
        const ds = new ListView.DataSource({ rowHasChanged(p1, p2) { return p1.id !== p2.id; } });
        const patients = this.props.tree.patients.data.get() || [];
        return {
            ds: ds.cloneWithRows(patients),
            canUpdate: true,
            activePatientId: 0,
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
        this.setState({ activePatientId });
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
                            tree={this.props.patientsImagesCursor.select(rowData.id)}
                            data={rowData}
                            isPatientActiveInListView={this.state.activePatientId === rowData.id}
                            activatePatient={this.activatePatient}
                            changeCurrentPatient={(patient, switchTab) => {
                                this.props.changeCurrentPatient(patient, switchTab);
                                this.activatePatient(undefined);
                            }}
                            navigator={this.props.navigator}
                            patientService={this.props.patientService}
                            imageService={this.props.imageService}
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
