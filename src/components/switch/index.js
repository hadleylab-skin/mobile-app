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
        itemWidth: React.PropTypes.number,
        disabled: React.PropTypes.bool,
        onPress: React.PropTypes.func,
    },

    onPress(value) {
        if (this.props.disabled) {
            return;
        }

        if (this.props.onPress) {
            this.props.onPress(value);

            return;
        }

        this.props.cursor.set(value);
    },

    render() {
        const { items, itemWidth, disabled } = this.props;
        const currentValue = this.props.cursor.get();

        return (
            <View style={[s.container, disabled ? s.containerDisabled : {}]}>
                {_.map(items, (item, index) => (
                    <TouchableWithoutFeedback
                        key={`switch-${index}`}
                        onPress={() => this.onPress(item.value)}
                    >
                        <View
                            style={[
                                s.item,
                                item.value === currentValue ? s.activeItem : {},
                                itemWidth ? { width: itemWidth } : {},
                            ]}
                        >
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
