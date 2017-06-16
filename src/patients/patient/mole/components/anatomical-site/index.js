import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Image,
} from 'react-native';
import schema from 'libs/state';
import { InfoField, AnatomicalSiteWidget } from 'components';
import arrowImage from 'components/icons/arrow/arrow.png';
import s from './styles';

const AnatomicalSite = schema({})(React.createClass({
    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        currentPatientPk: BaobabPropTypes.cursor.isRequired,
        patientsMoles: BaobabPropTypes.cursor.isRequired,
        services: React.PropTypes.shape({
            updateMoleService: React.PropTypes.func.isRequired,
            getPatientMolesService: React.PropTypes.func.isRequired,
        }),
    },

    async onAddingComplete(anatomicalSite) {
        const molePk = this.props.tree.get('pk');
        const patientPk = this.context.currentPatientPk.get();
        const service = this.context.services.updateMoleService;

        const data = { anatomicalSite };

        const result = await service(patientPk, molePk, this.props.tree.select('anatomicalSite'), data);

        if (result.status === 'Succeed') {
            this.context.mainNavigator.popN(2);

            await this.context.services.getPatientMolesService(
                patientPk,
                this.context.patientsMoles.select(patientPk, 'moles')
            );
        }
    },

    render() {
        const { anatomicalSite } = this.props.tree.get();

        return (
            <View style={s.container}>
                <InfoField
                    title={'Site'}
                    controls={
                        <View style={s.site}>
                            <Text style={s.siteText}>{anatomicalSite.data.name}</Text>
                            <Image source={arrowImage} style={s.siteArrow} />
                        </View>
                    }
                    hasNoBorder
                    onPress={() => {
                        this.context.mainNavigator.push({
                            component: AnatomicalSiteWidget,
                            title: 'Add photo',
                            onLeftButtonPress: () => this.context.mainNavigator.pop(),
                            onRightButtonPress: () => {
                                this.context.mainNavigator.pop();
                            },
                            navigationBarHidden: false,
                            rightButtonTitle: 'Cancel',
                            leftButtonIcon: require('components/icons/back/back.png'),
                            tintColor: '#FF1D70',
                            passProps: {
                                tree: this.context.patientsMoles.select(this.context.currentPatientPk.get()),
                                onlyChangeAnatomicalSite: true,
                                currentAnatomicalSite: anatomicalSite.data.pk,
                                onAddingComplete: (site) => this.onAddingComplete(site),
                            },
                        });
                    }}
                />
            </View>
        );
    },
}));

export default AnatomicalSite;
