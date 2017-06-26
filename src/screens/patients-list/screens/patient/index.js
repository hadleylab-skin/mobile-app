import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    ScrollView,
} from 'react-native';
import schema from 'libs/state';
import { getCreateOrEditPatientRoute } from 'screens/create-or-edit';
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
        cursors: React.PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
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
        const patientResult = await services.getPatientService(patientPk, cursors.patients.select(patientPk));

        if (moleResult.status === 'Succeed' && patientResult.status === 'Succeed') {
            return {
                status: 'Succeed',
            };
        }

        return {
            status: 'Failure',
        };
    },

    render() {
        const anatomicalSitesCursor = this.props.tree.select('anatomicalSites');
        const molesCursor = this.props.tree.select('moles');

        return (
            <Updater
                service={this.updatePatientScreen}
                style={s.container}
            >
                <ScrollView
                    onScroll={this.onScroll}
                    scrollEventThrottle={200}
                >
                    <GeneralInfo patientData={this.props.patientCursor.get('data')} />
                    <MolesInfo
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
