import React, { PropTypes } from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    Alert,
    Text,
    View,
    StyleSheet,
    ListView,
    ScrollView,
    Button,
    ActivityIndicator,
} from 'react-native';
import { getPatientList, createPatient, } from 'libs/services/patients';
import tree from 'libs/tree';
import schema from 'libs/state';
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
        if (offset < 0) {
            this.setState({ needUpdate: true });
        } else if (offset === 0 && this.state.needUpdate) {
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
            <ScrollView
                onScroll={this.onScroll}
                scrollEventThrottle={200}
            >
                {
                  showLoader
                  ?
                      <ActivityIndicator
                          style={{ paddingTop: 50 }}
                      />
                  :
                      null
                }{/*
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
                <View style={{ marginTop: showLoader ? 0 : 70, marginBottom: 50 }}>
                    {_.map(this.state.ds._dataBlob.s1, (item, index) => (
                        <Patient data={item} key={index} />
                    ))}
                </View>
                <Button
                    onPress={() =>
                        this.props.navigator.push({
                            component: AddPatient,
                            title: 'Add patient',
                            passProps: {
                                tree: this.props.tree.newPatient,
                                createPatientService: this.props.createPatientService,
                                onPatientAdded: () => this.props.patientsService(this.props.tree.patients),
                            },
                        })}
                    title="Add patient"
                />
            </ScrollView>
        );
    },
});
