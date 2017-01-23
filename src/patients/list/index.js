import React, { PropTypes } from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    ListView,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { getPatientList, createPatient } from 'libs/services/patients';
import tree from 'libs/tree';
import schema from 'libs/state';
import { NavBar } from 'components';
import Patient from './patient';
import { AddPatient } from '../add';

export function PatientList(props) {
    const token = tree.token.data.token.get();
    const patientsService = getPatientList(token);
    const createPatientService = createPatient(token);
    const model = {
        tree: {
            patients: patientsService,
            newPatient: {},
        },
    };
    const patientsScreenCursor = tree.patients;
    const Component = schema(model)(Patients);
    return (
        <Component
            {...props}
            tree={patientsScreenCursor}
            patientsService={patientsService}
            createPatientService={createPatientService}
        />
    );
}

const Patients = React.createClass({
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
                <NavBar
                    title="Patients"
                    leftBtnTitle="Back"
                    rightBtnTitle="Create"
                    onRightBtnPress={() =>
                        this.props.navigator.push({
                            component: AddPatient,
                            leftButtonTitle: 'Cancel',
                            onLeftButtonPress: () => this.props.navigator.pop(),
                            title: 'Create patient',
                            navigationBarHidden: true,
                            passProps: {
                                tree: this.props.tree.newPatient,
                                createPatientService: this.props.createPatientService,
                                onPatientAdded: () => this.props.patientsService(this.props.tree.patients),
                            },
                        })}
                />
                <ScrollView
                    onScroll={this.onScroll}
                    scrollEventThrottle={200}
                    style={{ flex: 1 }}
                >
                    <ActivityIndicator
                        animating={showLoader}
                        size="large"
                        color="#FF3952"
                        style={{ marginTop: -35, zIndex: 0 }}
                    />
                    {/*
                    <ListView
                        enableEmptySections
                        style={{ paddingTop: showLoader ? 0 : 70, paddingBottom: 50 }}
                        dataSource={this.state.ds}
                        renderRow={(rowData) => (
                            <Text>
                                {`${rowData.firstname} ${rowData.lastname} ${rowData.mrn}`}
                            </Text>
                        )}
                    />*/}
                    <View style={{ marginTop: 0 }}>
                        {_.map(this.state.ds._dataBlob.s1, (item, index) => (
                            <Patient data={item} key={index} />
                        ))}
                    </View>
                </ScrollView>
            </View>
        );
    },
});
