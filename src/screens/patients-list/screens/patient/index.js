import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import { ScrollView } from 'react-native';
import schema from 'libs/state';
import { getCreateOrEditPatientRoute } from 'screens/create-or-edit';
import { checkConsent } from 'screens/signature';
import { Updater } from 'components';
import { GeneralInfo } from './components/general-info';
import { MolesInfo } from './components/moles-info';
import { MolesList } from './components/moles-list';
import s from './styles';

const model = {
    tree: {
        widgetData: {},
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
            currentStudyPk: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
        }),
        services: React.PropTypes.shape({
            getPatientMolesService: React.PropTypes.func.isRequired,
            getPatientService: React.PropTypes.func.isRequired,
        }),
    },

    componentWillMount() {
        this.updatePatientScreen();
    },

    onAddingComplete() {
        this.context.mainNavigator.pop();
        this.props.onAddingComplete();
    },

    async updatePatientScreen() {
        const { cursors, services } = this.context;
        const patientPk = cursors.currentPatientPk.get();
        const currentStudyPk = cursors.currentStudyPk.get('data');
        const patientMolesCursor = cursors.patientsMoles.select(patientPk, 'moles');

        const moleResult = await services.getPatientMolesService(
            patientPk, patientMolesCursor, currentStudyPk);
        const patientResult = await services.getPatientService(
            patientPk, this.props.patientCursor, currentStudyPk);

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
        return checkConsent(
            this.props.patientCursor.data,
            this.context.services.updatePatientConsentService,
            this.context.mainNavigator);
    },

    render() {
        const widgetDataCursor = this.props.tree.select('widgetData');
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
                        widgetDataCursor={widgetDataCursor}
                        onAddingComplete={this.onAddingComplete}
                    />
                    <MolesList
                        tree={molesCursor}
                        checkConsent={this.checkConsent}
                        navigator={this.context.mainNavigator}
                    />
                </ScrollView>
            </Updater>
        );
    },
}));

export function getPatientRoute(props, context) {
    const { navigator } = props;
    const { firstName, lastName, pk } = props.patientCursor.get('data');
    const currentStudyPk = context.cursors.currentStudyPk.get('data');
    const doctor = { data: context.cursors.doctor };

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
                service: (cursor, data) => context.services.updatePatientService(
                    pk, cursor, data, currentStudyPk, doctor),
                onActionComplete: () => context.mainNavigator.pop(),
            }, context)
        ),
        navigationBarHidden: false,
        tintColor: '#FF2D55',
        passProps: props,
    };
}
