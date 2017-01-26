import React, { PropTypes } from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    ListView,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    NavigatorIOS,
} from 'react-native';
import schema from 'libs/state';
import Footer from '../../footer';
import Patient from './patient';
import { getRoute } from '../add';

const model = (props) => (
    {
        tree: {
            patients: props.patientsService,
            newPatient: {},
        },
    }
);

const PatientsListScreen = schema(model)(React.createClass({
    propTypes: {
        navigator: PropTypes.object.isRequired,
        tree: BaobabPropTypes.cursor.isRequired,
        patientsService: PropTypes.func.isRequired,
        createPatientService: PropTypes.func.isRequired,
    },

    getInitialState() {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });
        const patients = this.props.tree.patients.data.get() || [];
        return {
            ds: ds.cloneWithRows(patients),
            needUpdate: false,
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

    onScroll(e) {
        const offset = e.nativeEvent.contentOffset.y;
        if (offset >= 0) {
            this.setState({ needUpdate: true });
        } else if (offset < 0 && this.state.needUpdate) {
            this.setState({ needUpdate: false });
            if (this.props.tree.patients.status.get() !== 'Loading') {
                this.props.patientsService(this.props.tree.patients);
            }
        }
    },

    render() {
        const status = this.props.tree.patients.status.get();
        const showLoader = status === 'Loading';

        return (
            <View style={{ flex: 1 }}>
                <StatusBar hidden={false} />
                <ActivityIndicator
                    animating={showLoader}
                    size="large"
                    color="#FF3952"
                    style={{ marginTop: -35, zIndex: 0 }}
                />
                <ListView
                    enableEmptySections
                    onScroll={this.onScroll}
                    scrollEventThrottle={200}
                    style={{
                        marginTop: 0,
                        paddingBottom: 49,
                        borderTopWidth: 0.5,
                        borderTopColor: '#eee',
                    }}
                    dataSource={this.state.ds}
                    renderRow={(rowData) => (
                        <Patient data={rowData} />
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
                    tintColor: '#FF3952',
                }}
                style={{ flex: 1 }}
            />
        );
    },
});
