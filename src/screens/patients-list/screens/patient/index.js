import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    ScrollView,
} from 'react-native';
import schema from 'libs/state';
import { getCreateOrEditPatientRoute } from 'screens/create-or-edit';
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

    render() {
        const anatomicalSitesCursor = this.props.tree.select('anatomicalSites');
        const molesCursor = this.props.tree.select('moles');

        return (
            <View style={s.container}>
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
            </View>
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
