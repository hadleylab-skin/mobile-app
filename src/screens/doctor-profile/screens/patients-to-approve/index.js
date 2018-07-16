import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    Text,
    Alert,
    ListView,
    StatusBar,
    Dimensions,
} from 'react-native';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
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

    getInitialState() {
        const dsApprovals = new ListView.DataSource({ rowHasChanged(p1, p2) { return !_.isEqual(p1, p2); } });
        const dsDeclines = new ListView.DataSource({ rowHasChanged(p1, p2) { return !_.isEqual(p1, p2); } });
        const dsInvites = new ListView.DataSource({ rowHasChanged(p1, p2) { return !_.isEqual(p1, p2); } });

        const allInvites = this.props.tree.patientsToApprove.get('data');
        const approvals = _.filter(
            allInvites,
            (invite) => invite.participant && invite.status === 'new');
        const declines = _.filter(
            allInvites,
            (invite) => invite.participant && invite.status === 'declined');
        const invites = _.filter(allInvites, (invite) => !invite.participant);

        return {
            tabs: {
                index: 0,
                routes: [
                    { key: 'approvals', title: 'To Approve' },
                    { key: 'declines', title: 'Declined' },
                    { key: 'invites', title: 'Invites' },
                ],
            },
            dsApprovals: dsApprovals.cloneWithRows(approvals),
            dsDeclines: dsDeclines.cloneWithRows(declines),
            dsInvites: dsInvites.cloneWithRows(invites),
        };
    },

    componentWillMount() {
        this.props.tree.patientsToApprove.on('update', this.prepareListData);
    },

    componentWillUnmount() {
        this.props.tree.patientsToApprove.off('update', this.prepareListData);
    },

    prepareListData(event) {
        const data = event.data.currentData;
        if (data.status === 'Succeed') {
            const allInvites = data.data;
            const approvals = _.filter(
                allInvites,
                (invite) => invite.participant && invite.status === 'new');
            const declines = _.filter(
                allInvites,
                (invite) => invite.participant && invite.status === 'declined');
            const invites = _.filter(allInvites, (invite) => !invite.participant);

            this.setState({
                dsApprovals: this.state.dsApprovals.cloneWithRows(approvals),
                dsDeclines: this.state.dsDeclines.cloneWithRows(declines),
                dsInvites: this.state.dsInvites.cloneWithRows(invites),
            });
        }
    },

    async approvePatient(patient) {
        const { services } = this.context;

        const result = await services.approveInviteForDoctorService(
            this.props.tree.approveInviteResult, patient);
        this.updateInvites(result.data);
    },

    async declinePatient(patient) {
        const { services } = this.context;

        const result = await services.declineInviteForDoctorService(
            this.props.tree.declineInviteResult, patient);
        this.updateInvites(result.data);
    },

    updateInvites(item) {
        const cursorForReplace = this.props.tree.patientsToApprove.select(
            'data', (invite) => invite.pk === item.pk);
        cursorForReplace.set(item);
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

    renderPatient(patient) {
        return (
            <InfoField
                title={`${patient.patient.firstName} ${patient.patient.lastName} (${patient.email})`}
                onPress={() => this.patientClicked(patient)}
                hasNoBorder={false}
            />
        );
    },

    renderList(listDs) {
        if (listDs.getRowCount() === 0) {
            return (
                <View style={s.noItemsWrapper}>
                    <Text style={s.noItemsText}>
                        No items in this section
                    </Text>
                </View>
            );
        }

        return (
            <ListView
                enableEmptySections
                scrollEventThrottle={20}
                automaticallyAdjustContentInsets={false}
                style={{ flex: 1 }}
                dataSource={listDs}
                renderRow={(rowData) => (this.renderPatient(rowData))}
            />
        );
    },

    render() {
        return (
            <View style={{ flex: 1 }}>
                <StatusBar barStyle="dark-content" />
                <TabView
                    navigationState={this.state.tabs}
                    renderTabBar={(props) =>
                        <TabBar
                            {...props}
                            getLabelText={({ route }) => route.title}
                            style={s.tabBar}
                            labelStyle={s.tabBarLabel}
                            indicatorStyle={s.tabBarIndicator}
                        />}
                    renderScene={SceneMap({
                        approvals: () => this.renderList(this.state.dsApprovals),
                        declines: () => this.renderList(this.state.dsDeclines),
                        invites: () => this.renderList(this.state.dsInvites),
                    })}
                    onIndexChange={(index) => this.setState({
                        tabs: {
                            index,
                            routes: this.state.tabs.routes,
                        },
                    })}
                    initialLayout={{
                        width: Dimensions.get('window').width,
                        height: Dimensions.get('window').height,
                    }}
                />
            </View>
        );
    },
}));

export function getPatientsToApproveListRoute(props, context) {
    return {
        component: PatientsToApproveList,
        title: 'Patients to approve',
        onLeftButtonPress: () => context.mainNavigator.pop(),
        leftButtonIcon: require('components/icons/back/back.png'),
        navigationBarHidden: false,
        tintColor: '#FF2D55',
        passProps: props,
    };
}
