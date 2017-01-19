import React, { PropTypes } from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    Alert,
    Text,
    StyleSheet,
    ListView,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import getPatients from 'libs/services/patients';
import tree from 'libs/tree';
import schema from 'libs/state';

export default function (props) {
    const token = tree.token.data.token.get();
    const patientsService = getPatients(token);
    const model = {
        tree: {
            patients: patientsService,
        },
    };
    const patientsScreenCursor = tree.patients;
    const Component = schema(model)(Patients);
    return (
        <Component
            {...props}
            tree={patientsScreenCursor}
            patientsService={patientsService}
        />
    );
}

const Patients = React.createClass({
    propTypes: {
        navigator: PropTypes.object.isRequired,
        tree: BaobabPropTypes.cursor.isRequired,
        patientsService: PropTypes.func.isRequired,
    },

    getInitialState() {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });
        return {
            ds,
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
        console.log(status, showLoader);
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
                }
                <ListView
                    style={{ paddingTop: showLoader ? 0 : 70, paddingBottom: 50 }}
                    dataSource={this.state.ds}
                    renderRow={(rowData) => <Text>{`${rowData.firstname} ${rowData.lastname} ${rowData.mrn}`}</Text>}
                />
            </ScrollView>
        );
    },
});

const styles = StyleSheet.create({
    text: {
        color: '#fff',
        fontSize: 12,
        lineHeight: 12,
    },
});
