import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
} from 'react-native';
import { Button } from 'components';
import { getAnatomicalSiteWidgetRoute } from 'screens/anatomical-site-widget';
import s from './styles';

export const MolesInfo = React.createClass({
    propTypes: {
        anatomicalSitesCursor: BaobabPropTypes.cursor.isRequired, //eslint-disable-line
        onAddingComplete: React.PropTypes.func.isRequired,
        checkConsent: React.PropTypes.func.isRequired, //eslint-disable-line
    },

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    async addNewMole() {
        let isConsentValid = await this.props.checkConsent();
        if (isConsentValid) {
            this.context.mainNavigator.push(
                getAnatomicalSiteWidgetRoute({
                    tree: this.props.anatomicalSitesCursor,
                    onAddingComplete: this.props.onAddingComplete,
                }, this.context));
        }
    },

    render() {
        return (
            <View style={s.container}>
                {/*
                // TODO should be refactored after data will be added to API
                moles && (benign || malignant) ?
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
                : null
                */}
                <Button
                    title="Add a new mole"
                    onPress={this.addNewMole}
                />
           </View>
        );
    },
});
