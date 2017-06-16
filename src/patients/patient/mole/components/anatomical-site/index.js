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
    },

    render() {
        const { anatomicalSites } = this.props.tree.get();
        const anatomicalSite = anatomicalSites[anatomicalSites.length - 1];

        return (
            <View style={s.container}>
                <InfoField
                    title={'Site'}
                    controls={
                        <View style={s.site}>
                            <Text style={s.siteText}>{anatomicalSite.name}</Text>
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
                                currentAnatomicalSite: anatomicalSite.pk,
                                onAddingComplete: () => this.context.mainNavigator.pop(),
                            },
                        });
                    }}
                />
            </View>
        );
    },
}));

export default AnatomicalSite;
