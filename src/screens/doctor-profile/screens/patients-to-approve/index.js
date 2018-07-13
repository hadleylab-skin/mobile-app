import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    Text,
    StatusBar,
    SectionList,
} from 'react-native';
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

    perepareSectionListData() {
        const patientsToApprove = this.props.tree.patientsToApprove.get('data');
        const registeredPatients = _.filter(patientsToApprove, (patient) => patient.participant);
        const otherPatients = _.filter(patientsToApprove, (patient) => !patient.participant);

        return [
            { title: 'Patients to approve', data: registeredPatients },
            { title: 'Invited but not registered patients', data: otherPatients },
        ];
    },

    renderPatient({ item: patient }) {
        return (
            <View style={s.patient}>
                <View style={s.patientInner}>
                    <Text>
                        {patient.email}
                    </Text>
                </View>
                <View style={s.border} />
            </View>
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
        const patientsSectionListData = this.perepareSectionListData();

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
