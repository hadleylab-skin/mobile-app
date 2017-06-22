import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
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
        tree: {
            moles: (cursor) => context.services.getPatientMolesService(context.currentPatientPk.get(), cursor),
        },
    }
);

export const MolesList = schema(model)(React.createClass({
    propTypes: {
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    contextTypes: {
        currentPatientPk: BaobabPropTypes.cursor.isRequired,
        services: React.PropTypes.shape({
            getPatientMolesService: React.PropTypes.func.isRequired,
        }),
    },

    render() {
        const status = this.props.tree.moles.status.get();
        const showLoader = status === 'Loading';
        const moles = this.props.tree.moles.get('data') || [];
        const groupedMolesData = !_.isEmpty(moles) ?
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
                                hasBorder={index !== 0}
                                navigator={this.props.navigator}
                                tree={this.props.tree.select('moles', 'data', mole.data.pk, 'data')}
                            />
                        ))}
                    </View>
                ))}
            </View>
        );
    },
}));
