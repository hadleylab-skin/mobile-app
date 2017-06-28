import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    AlertIOS,
    View,
    ScrollView,
} from 'react-native';
import moment from 'moment';
import schema from 'libs/state';
import { getCreateOrEditPatientRoute } from 'screens/create-or-edit';
import { getSignatureRoute } from 'screens/signature';
import { Updater } from 'components';
import { GeneralInfo } from './components/general-info';
import { MolesInfo } from './components/moles-info';
import { MolesList } from './components/moles-list';
import s from './styles';

const model = {
    tree: {
        anatomicalSites: {},
        moles: {},
    },
};

export const Patient = schema(model)(React.createClass({
    displayName: 'Patient',

    propTypes: {
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
        tree: BaobabPropTypes.cursor.isRequired,
        patientCursor: BaobabPropTypes.cursor.isRequired,
        onAddingComplete: React.PropTypes.func.isRequired,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired,
        cursors: React.PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
        }),
        services: React.PropTypes.shape({
            getPatientMolesService: React.PropTypes.func.isRequired,
            getPatientService: React.PropTypes.func.isRequired,
        }),
    },

    async updatePatientScreen() {
        const { cursors, services } = this.context;
        const patientPk = cursors.currentPatientPk.get();
        const patientMolesCursor = cursors.patientsMoles.select(patientPk, 'moles');

        const moleResult = await services.getPatientMolesService(patientPk, patientMolesCursor);
        const patientResult = await services.getPatientService(patientPk, this.props.patientCursor);

        if (moleResult.status === 'Succeed' && patientResult.status === 'Succeed') {
            return {
                status: 'Succeed',
            };
        }

        return {
            status: 'Failure',
        };
    },

    checkConsent() {
        const patientCursor = this.props.patientCursor.data;
        const isConsentValid = moment(patientCursor.get('validConsent', 'data', 'dateExpired')) > moment();
        if (!isConsentValid) {
            return new Promise((resolve) => {
                AlertIOS.alert(
                    'The consent is expired',
                    'Please, update the patient\'s consent.',
                    () => this.context.mainNavigator.push(
                        getSignatureRoute({
                            navigator: this.context.mainNavigator,
                            onReject: () => resolve(false),
                            onSave: async (signatureData) => {
                                await this.context.services.updatePatientConsentService(
                                    patientCursor.get('pk'),
                                    patientCursor.validConsent,
                                    signatureData.encoded,
                                );
                                this.context.mainNavigator.pop();
                                setTimeout(() => resolve(true), 1000);
                            },
                        })));
            });
        }
        return new Promise((resolve) => resolve(true));
    },

    render() {
        const anatomicalSitesCursor = this.props.tree.select('anatomicalSites');
        const molesCursor = this.props.tree.select('moles');
        const patientCursor = this.props.patientCursor.data;


        return (
            <Updater
                service={this.updatePatientScreen}
                style={s.container}
            >
                <ScrollView
                    onScroll={this.onScroll}
                    scrollEventThrottle={200}
                >
                    <GeneralInfo
                        patientCursor={patientCursor}
                    />
                    <MolesInfo
                        checkConsent={this.checkConsent}
                        anatomicalSitesCursor={anatomicalSitesCursor}
                        onAddingComplete={this.props.onAddingComplete}
                    />
                    <MolesList
                        tree={molesCursor}
                        navigator={this.props.navigator}
                    />
                </ScrollView>
            </Updater>
        );
    },
}));

export function getPatientRoute(props, context) {
    const { navigator } = props;
    const { firstName, lastName, pk } = props.patientCursor.get('data');

    return {
        component: Patient,
        title: `${firstName} ${lastName}`,
        onLeftButtonPress: () => navigator.pop(),
        rightButtonTitle: 'Edit',
        onRightButtonPress: () => context.mainNavigator.push(
            getCreateOrEditPatientRoute({
                tree: props.patientCursor,
                dataCursor: props.patientCursor.select('data'),
                title: 'Edit Patient',
                service: (cursor, data) => context.services.updatePatientService(pk, cursor, data),
                onActionComplete: () => context.mainNavigator.pop(),
            }, context)
        ),
        navigationBarHidden: false,
        tintColor: '#FF2D55',
        passProps: props,
    };
}
