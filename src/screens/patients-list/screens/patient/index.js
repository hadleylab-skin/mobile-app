import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    Alert,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import schema from 'libs/state';
import { getCreateOrEditPatientRoute } from 'screens/create-or-edit';
import { checkConsent } from 'screens/signature';
import { Updater } from 'components';
import { isStudyConsentExpired } from 'libs/misc';
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

export const Patient = schema(model)(createReactClass({
    displayName: 'Patient',

    propTypes: {
        navigator: PropTypes.object.isRequired, // eslint-disable-line
        tree: BaobabPropTypes.cursor.isRequired,
        patientCursor: BaobabPropTypes.cursor.isRequired,
        onAddingComplete: PropTypes.func.isRequired,
        studiesCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired,
        cursors: PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            currentStudyPk: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
        }),
        services: PropTypes.shape({
            getPatientMolesService: PropTypes.func.isRequired,
            getPatientService: PropTypes.func.isRequired,
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
        const { cursors, services, mainNavigator } = this.context;
        const currentPatientPk = cursors.currentPatientPk.get();

        const studies = this.props.studiesCursor.get();
        const isStudyExpired = isStudyConsentExpired(
            studies.data,
            cursors.currentStudyPk.get('data'),
            currentPatientPk);
        if (isStudyExpired) {
            Alert.alert(
                'Study consent expired',
                'You need to re-sign study consent to add new images'
            );

            return;
        }

        return checkConsent(
            this.props.patientCursor.data,
            services.updatePatientConsentService,
            mainNavigator);
    },

    render() {
        const widgetDataCursor = this.props.tree.select('widgetData');
        const molesCursor = this.props.tree.select('moles');
        const patientCursor = this.props.patientCursor.data;

        let studyConsent = null;
        const { pk } = patientCursor.get();
        const studies = this.props.studiesCursor.get('data');
        const currentStudyPk = this.context.cursors.currentStudyPk.get('data');
        const selectedStudy = _.find(studies, (study) => study.pk === currentStudyPk);
        if (selectedStudy) {
            studyConsent = selectedStudy.patientsConsents[pk];
        }

        return (
            <SafeAreaView
                style={s.safeWrapper}
            >
                <Updater
                    style={s.container}
                    service={this.updatePatientScreen}
                >
                    <ScrollView
                        onScroll={this.onScroll}
                        scrollEventThrottle={200}
                    >
                        <GeneralInfo
                            patientCursor={patientCursor}
                            studyConsent={studyConsent}
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
            </SafeAreaView>
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
