import React from 'react';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    TouchableWithoutFeedback,
} from 'react-native';
import s from './styles';

export const Switch = React.createClass({
    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
        items: React.PropTypes.arrayOf(React.PropTypes.shape({
            label: React.PropTypes.string,
            value: React.PropTypes.oneOfType([
                React.PropTypes.string,
                React.PropTypes.bool,
            ]),
        })).isRequired,
    },

    render() {
        const { items } = this.props;
        const currentValue = this.props.cursor.get();

        return (
            <View style={s.container}>
                {_.map(items, (item, index) => (
                    <TouchableWithoutFeedback
                        key={`switch-${index}`}
                        onPress={() => this.props.cursor.set(item.value)}
                    >
                        <View style={[s.item, item.value === currentValue ? s.activeItem : {}]}>
                            <Text
                                style={[s.text, item.value === currentValue ? s.activeItemText : {}]}
                            >{item.label}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                ))}
            </View>
        );
    },
});
