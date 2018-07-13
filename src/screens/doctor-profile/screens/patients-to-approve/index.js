import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    Text,
    Alert,
    StatusBar,
    SectionList,
} from 'react-native';
import { InfoField } from 'components';
import schema from 'libs/state';
import s from './styles';


const model = {
    tree: {
        patientsToApprove: {},
    },
};


export const PatientsToApproveList = schema(model)(createReactClass({
    propTypes: {},

    contextTypes: {
        services: PropTypes.shape({}),
    },

    prepareSectionListData() {
        const patientsToApprove = this.props.tree.patientsToApprove.get('data');
        const registeredPatients = _.filter(patientsToApprove, (patient) => patient.participant);
        const otherPatients = _.filter(patientsToApprove, (patient) => !patient.participant);

        return [
            { title: 'Patients to approve', data: registeredPatients },
            { title: 'Invited but not registered patients', data: otherPatients },
        ];
    },

    approvePatient(patient) {
        console.log(patient);
    },

    declinePatient(patient) {
        console.log(patient);
    },

    patientClicked(patient) {
        if (!patient.participant) {
            return;
        }

        Alert.alert(
            'Patient approving',
            'You may approve or decline this patient',
            [
                {
                    text: 'Approve',
                    onPress: () => this.approvePatient(patient),
                },
                {
                    text: 'Decline',
                    onPress: () => this.declinePatient(patient),
                },
            ]
        );
    },

    renderPatient({ item: patient }) {
        return (
            <InfoField
                title={`${patient.patient.firstName} ${patient.patient.lastName} (${patient.email})`}
                onPress={() => this.patientClicked(patient)}
            >
            </InfoField>
        );
    },

    renderSectionHeader({ section: { title } }) {
        return (
            <View style={s.header}>
                <Text style={s.headerText}>
                    {title}
                </Text>
                <View style={s.border} />
            </View>
        );
    },

    render() {
        const patientsSectionListData = this.prepareSectionListData();

        return (
            <View style={{ flex: 1 }}>
                <StatusBar barStyle="dark-content" />
                <SectionList
                    renderItem={this.renderPatient}
                    renderSectionHeader={this.renderSectionHeader}
                    sections={patientsSectionListData}
                    keyExtractor={(item) => `patient-${item.pk}`}
                    style={{ flex: 1 }}
                />
            </View>
        );
    },
}));

export function getPatientsToApproveListRoute(props) {
    return {
        component: PatientsToApproveList,
        title: 'Patients to approve',
        navigationBarHidden: false,
        tintColor: '#FF2D55',
        passProps: props,
    };
}
