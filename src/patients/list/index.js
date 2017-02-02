import React, { PropTypes } from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    ListView,
    ActivityIndicator,
    StatusBar,
    NavigatorIOS,
    StyleSheet,
} from 'react-native';
import schema from 'libs/state';
import PatientListItem from './patient-list-item';
import { getRoute } from '../add';

const model = (props) => (
    {
        tree: {
            patients: props.patientsService,
            patientsImages: {},
            newPatient: {},
        },
    }
);

const PatientsListScreen = schema(model)(React.createClass({
    propTypes: {
        navigator: PropTypes.object.isRequired,
        tree: BaobabPropTypes.cursor.isRequired,
        changeCurrentPatient: PropTypes.func.isRequired,
        patientsService: PropTypes.func.isRequired,
        createPatientService: PropTypes.func.isRequired,
    },

    getInitialState() {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id === r2.id });
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
            this.setState({
                ds: this.state.ds.cloneWithRows(event.data.currentData.data),
            });
        }
    },

    activatePatient(activePatientId) {
        this.setState({ activePatientId });
    },

    async onScroll(e) {
        const offset = e.nativeEvent.contentOffset.y;
        if (offset < 0 && this.state.canUpdate && this.props.tree.patients.status.get() !== 'Loading') {
            this.setState({ canUpdate: false });
            await this.props.patientsService(this.props.tree.patients);
            this.setState({ canUpdate: true });
        }
    },

    render() {
        const status = this.props.tree.patients.status.get();
        const showLoader = status === 'Loading';

        return (
            <View style={{ flex: 1 }}>
                <View style={styles.activityIndicator}>
                    <ActivityIndicator
                        animating={showLoader}
                        size="large"
                        color="#FF2D55"
                    />
                </View>
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
                            tree={this.props.tree.patientsImages.select(rowData.id)}
                            data={rowData}
                            isPatientActiveInListView={this.state.activePatientId === rowData.id}
                            activatePatient={this.activatePatient}
                            changeCurrentPatient={this.props.changeCurrentPatient}
                            mainNavigator={this.props.mainNavigator}
                            token={this.props.token}
                        />
                    )}
                />
            </View>
        );
    },
}));

export const PatientsList = React.createClass({
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

const styles = StyleSheet.create({
    activityIndicator: {
        position: 'absolute',
        top: 85,
        left: 0,
        right: 0,
        justifyContent: 'center',
    },
});
