import React from 'react';
import {
    View,
    Text,
} from 'react-native';
import { Button } from 'components';
import { AnatomicalSiteWidget } from 'components';
import BaobabPropTypes from 'baobab-prop-types';
import s from './styles';

export const MolesInfo = React.createClass({
    propTypes: {
        moles: React.PropTypes.number,
        benign: React.PropTypes.number,
        malignant: React.PropTypes.number,
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
        currentPatientPk: BaobabPropTypes.cursor.isRequired,
        patients: BaobabPropTypes.cursor.isRequired,
        patientsMoles: BaobabPropTypes.cursor.isRequired,
        services: React.PropTypes.shape({
            getPatientMolesService: React.PropTypes.func.isRequired,
            patientsService: React.PropTypes.func.isRequired,
        }),
    },

    async onAddingComplete() {
        const patientPk = this.context.currentPatientPk.get();

        await this.context.services.patientsService(this.context.patients);
        await this.context.services.getPatientMolesService(
            patientPk,
            this.context.patientsMoles.select(patientPk, 'moles')
        );
    },

    render() {
        const { moles, benign, malignant } = this.props;

        return (
            <View style={s.container}>
                {moles && (benign || malignant) ?
                    <View style={s.moles}>
                        <Text style={s.text}>
                            {moles === 1 ? ' mole: ' : ' moles: '}
                            {benign ?
                                <Text>
                                    {benign} benign
                                    {', '}
                                </Text>
                            : null}
                            {malignant ?
                                <Text>{malignant} malignant</Text>
                            : null}
                        </Text>
                    </View>
                : null}
                <Button
                    title="Add a new mole"
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
                            tintColor: '#FF2D55',
                            passProps: {
                                tree: this.props.tree,
                                onAddingComplete: this.onAddingComplete,
                            },
                        });
                    }}
                />
            </View>
        );
    },
});
