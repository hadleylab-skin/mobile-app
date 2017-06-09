import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import schema from 'libs/state';
import { GeneralInfo } from './components/general-info';
import { MolesInfo } from './components/moles-info';
import { MolesList } from './components/moles-list';
import s from './styles';

const Patient = schema({})(React.createClass({
    displayName: 'Patient',

    propTypes: {
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
        tree: BaobabPropTypes.cursor.isRequired,
        patientCursor: BaobabPropTypes.cursor.isRequired,
    },

    render() {
        return (
            <View style={s.container}>
                <ScrollView
                    onScroll={this.onScroll}
                    scrollEventThrottle={200}
                >
                    <GeneralInfo
                        {...this.props.patientCursor.get('data')}
                        consentCursor={this.props.patientCursor.select('consentDateExpired')}
                    />
                    <MolesInfo tree={this.props.tree} />
                    <MolesList
                        tree={this.props.tree}
                        navigator={this.props.navigator}
                    />
                </ScrollView>
            </View>
        );
    },
}));

export default Patient;
