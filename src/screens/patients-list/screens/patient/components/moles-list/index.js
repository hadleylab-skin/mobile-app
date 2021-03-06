import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import _ from 'lodash';
import {
    View,
    ActivityIndicator,
} from 'react-native';
import schema from 'libs/state';
import { Title } from 'components';
import { Mole } from './components/mole';
import s from './styles';

const model = (props, context) => (
    {
        tree: (cursor) => context.services.getPatientMolesService(
            context.cursors.currentPatientPk.get(),
            cursor,
            context.cursors.currentStudyPk.get('data')),
    }
);

export const MolesList = schema(model)(createReactClass({
    propTypes: {
        navigator: PropTypes.object.isRequired, // eslint-disable-line
        checkConsent: PropTypes.func.isRequired,
    },

    contextTypes: {
        cursors: PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            currentStudyPk: BaobabPropTypes.cursor.isRequired,
        }),
        services: PropTypes.shape({
            getPatientMolesService: PropTypes.func.isRequired,
        }),
    },

    render() {
        const status = this.props.tree.status.get();
        const showLoader = status === 'Loading';
        const moles = this.props.tree.get('data') || [];
        const groupedMolesData = !_.isEmpty(this.props.tree.get()) ?
            _.groupBy(moles, (mole) => mole.data.anatomicalSites[0].pk)
            : [];

        return (
            <View style={s.container}>
                {showLoader ?
                    <View style={s.activityIndicator}>
                        <ActivityIndicator
                            animating={showLoader}
                            size="large"
                            color="#FF1D70"
                        />
                    </View>
                : null}
                {_.map(groupedMolesData, (molesGroup, key) => (
                    <View key={key}>
                        <Title text={key} />
                        {_.map(molesGroup, (mole, index) => (
                            <Mole
                                key={`${key}-${index}`}
                                checkConsent={this.props.checkConsent}
                                hasBorder={index !== 0}
                                navigator={this.props.navigator}
                                tree={this.props.tree.select('data', mole.data.pk, 'data')}
                            />
                        ))}
                    </View>
                ))}
            </View>
        );
    },
}));
