import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Image,
    TouchableWithoutFeedback,
} from 'react-native';
import s from './styles';

import filterGrayIcon from './images/filter.png';
import filterPinkIcon from './images/filter-pink.png';

const Filter = React.createClass({
    displayName: 'Filter',

    propTypes: {
        filter: BaobabPropTypes.cursor.isRequired,
        filterPatients: React.PropTypes.func.isRequired,
    },

    onFilterPress() {
        const { filter } = this.props;

        if (filter.get('pathPending')) {
            filter.pathPending.set(false);
        } else {
            filter.pathPending.set(true);
        }

        this.props.filterPatients();
    },

    render() {
        const filter = this.props.filter.get();

        return (
            <View style={s.container}>
                <TouchableWithoutFeedback onPress={this.onFilterPress}>
                    <Image source={filter.pathPending ? filterPinkIcon : filterGrayIcon} />
                </TouchableWithoutFeedback>
            </View>
        );
    },
});

export default Filter;
