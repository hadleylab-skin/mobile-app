import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    ActivityIndicator,
    Alert,
    PickerIOS,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import schema from 'libs/state';
import { Button } from 'components';
import { getSitesService } from 'services/constants';
import s from './styles';

const model = {
    tree: {
        selectedSite: null,
        availableSites: {},
        result: {},
    },
};

const SiteJoinRequest = schema({})(createReactClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        siteJoinRequestCursor: BaobabPropTypes.cursor.isRequired,
        afterRequestSended: PropTypes.func.isRequired,
        navigator: PropTypes.object.isRequired, // eslint-disable-line
    },
    contextTypes: {
        services: PropTypes.shape({
            createSiteJoinRequestService: PropTypes.func.isRequired,
        }),
    },

    async componentWillMount() {
        this.props.tree.set(model.tree);
        const result = await getSitesService(this.props.tree.availableSites);
        const lastOption = _.last(result.data);
        if (lastOption) {
            this.props.tree.selectedSite.set(lastOption.pk);
        }
    },

    async onAddNewRequest() {
        let result = await this.context.services.createSiteJoinRequestService(
            this.props.tree.result,
            { site: this.props.tree.selectedSite.get() });
        if (result.status === 'Failure') {
            Alert.alert('Error', JSON.stringify(result.error.data));
            return;
        }
        await this.props.afterRequestSended();
        this.props.navigator.pop();
    },

    getOptions() {
        const { status, data } = this.props.tree.availableSites.get();
        if (status !== 'Succeed') {
            return [];
        }
        return data;
    },

    render() {
        const siteCursor = this.props.tree.selectedSite;
        const pickerOptions = this.getOptions();

        const isLoading = this.props.tree.result.status === 'Loading';

        if (_.isEmpty(pickerOptions)) {
            return (
                <View style={{ top: 200 }}>
                    <ActivityIndicator />
                </View>
            );
        }

        return (
            <SafeAreaView style={s.container}>
                <StatusBar barStyle="dark-content" />
                <View style={s.content}>
                    <PickerIOS
                        selectedValue={siteCursor.get()}
                        onValueChange={(value) => siteCursor.set(value)}
                    >
                        {_.map(pickerOptions, ({ pk, title }) => (
                            <PickerIOS.Item
                                key={pk}
                                value={pk}
                                label={title}
                            />
                        ))}
                    </PickerIOS>
                </View>
                {isLoading ?
                    <ActivityIndicator />
                :
                    <View
                        style={s.button}
                    >
                        <Button
                            title="Send join request"
                            onPress={this.onAddNewRequest}
                        />
                    </View>
                }
            </SafeAreaView>
        );
    },
}));

export function getSiteJoinRequestRoute(props) {
    return {
        component: SiteJoinRequest,
        title: 'Site Join Request',
        navigationBarHidden: false,
        tintColor: '#FF2D55',
        passProps: props,
    };
}
