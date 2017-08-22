import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    Text,
    View,
    Image,
    Modal,
    TouchableWithoutFeedback,
    TouchableOpacity,
} from 'react-native';
import { BlurView } from 'react-native-blur';
import s from './styles';

import filterGrayIcon from './images/filter.png';
import filterPinkIcon from './images/filter-pink.png';
import tickIcon from './images/tick.png';

const Filter = React.createClass({
    displayName: 'Filter',

    contextTypes: {
        cursors: React.PropTypes.shape({
            patients: BaobabPropTypes.cursor.isRequired,
            filter: React.PropTypes.object.isRequired, // eslint-disable-line,
        }),
        services: React.PropTypes.shape({
            patientsService: React.PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        return {
            isOpened: false,
        };
    },

    onPathPendingPress() {
        const filter = this.context.cursors.filter;

        if (filter.get('pathPending')) {
            filter.pathPending.set(false);
        } else {
            filter.pathPending.set(true);
        }

        this.filterPatients();
    },

    async filterPatients() {
        const queryParams = this.context.cursors.filter.get();

        await this.context.services.patientsService(this.context.cursors.patients, queryParams);
    },

    toggleFilter() {
        const isOpened = !this.state.isOpened;

        this.setState({ isOpened });
    },

    onCancel() {
        const filter = this.context.cursors.filter;

        filter.pathPending.set(false);
        this.filterPatients();
    },

    render() {
        const { isOpened } = this.state;
        const filter = this.context.cursors.filter.get();
        const { pathPending } = filter;

        return (
            <View style={s.container}>
                <TouchableWithoutFeedback onPress={this.toggleFilter}>
                    <Image source={pathPending ? filterPinkIcon : filterGrayIcon} />
                </TouchableWithoutFeedback>
                <Modal
                    animationType="none"
                    transparent
                    visible={isOpened}
                >
                    <View style={[s.bg, s.absolute]} ref={(ref) => { this.blurView = ref; }} />
                    <BlurView
                        style={s.absolute}
                        viewRef={this.blurView}
                        blurType="light"
                        blurAmount={5}
                    />
                    <TouchableWithoutFeedback onPress={this.toggleFilter}>
                        <View style={s.absolute} />
                    </TouchableWithoutFeedback>
                    <View style={s.buttonWrapper}>
                        <TouchableWithoutFeedback onPress={this.toggleFilter}>
                            <Image source={isOpened ? filterPinkIcon : filterGrayIcon} />
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={s.list}>
                        <TouchableOpacity onPress={this.onPathPendingPress} activeOpacity={0.5}>
                            <View style={s.listItem}>
                                <Text style={s.text}>Require Path</Text>
                                {pathPending ?
                                    <Image source={tickIcon} />
                                : null}
                            </View>
                        </TouchableOpacity>
                        {pathPending ?
                            <TouchableOpacity onPress={this.onCancel} activeOpacity={0.5}>
                                <View style={[s.listItem, s.cancel]}>
                                    <Text style={[s.text, s.redText]}>Cancel</Text>
                                </View>
                            </TouchableOpacity>
                        : null}
                    </View>
                </Modal>
            </View>
        );
    },
});

export default Filter;
