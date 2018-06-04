import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    View,
} from 'react-native';
import { Button } from 'components';
import { getAnatomicalSiteWidgetRoute } from 'screens/anatomical-site-widget';
import s from './styles';

export const MolesInfo = createReactClass({
    propTypes: {
        widgetDataCursor: BaobabPropTypes.cursor.isRequired, //eslint-disable-line
        onAddingComplete: PropTypes.func.isRequired,
        checkConsent: PropTypes.func.isRequired, //eslint-disable-line
    },

    contextTypes: {
        mainNavigator: PropTypes.object.isRequired, // eslint-disable-line
    },

    async addNewMole() {
        let isConsentValid = await this.props.checkConsent();
        if (isConsentValid) {
            this.context.mainNavigator.push(
                getAnatomicalSiteWidgetRoute({
                    tree: this.props.widgetDataCursor,
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
                    title="Add a new skin image"
                    onPress={this.addNewMole}
                />
            </View>
        );
    },
});
