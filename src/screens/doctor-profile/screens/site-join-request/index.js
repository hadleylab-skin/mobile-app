import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    ActivityIndicator,
    Alert,
    PickerIOS,
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

const SiteJoinRequest = schema({})(React.createClass({
    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        siteJoinRequestCursor: BaobabPropTypes.cursor.isRequired,
        afterRequestSended: React.PropTypes.func.isRequired,
        navigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },
    contextTypes: {
        services: React.PropTypes.shape({
            createSiteJoinRequestService: React.PropTypes.func.isRequired,
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
            <View style={s.container}>
                <Text style={s.title}>Create site join request</Text>
                <PickerIOS
                    style={s.container}
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
                <View style={s.container}>
                    {
                            isLoading
                        ?
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
                </View>
            </View>
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

