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
        declineInviteResult: {},
        approveInviteResult: {},
    },
};


export const PatientsToApproveList = schema(model)(createReactClass({
    propTypes: {},

    contextTypes: {
        services: PropTypes.shape({
            approveInviteForDoctorService: PropTypes.func.isRequired,
            declineInviteForDoctorService: PropTypes.func.isRequired,
        }),
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

    async approvePatient(patient) {
        const { services } = this.context;

        const result = await services.approveInviteForDoctorService(
            this.props.tree.approveInviteResult, patient);
        console.log(result);
    },

    async declinePatient(patient) {
        const { services } = this.context;

        const result = await services.declineInviteForDoctorService(
            this.props.tree.declineInviteResult, patient);
        console.log(result);
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
                {
                    text: 'Close',
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
