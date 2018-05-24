import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    Text,
    TouchableWithoutFeedback,
} from 'react-native';
import s from './styles';

export const Switch = createReactClass({
    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
        items: PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.bool,
            ]),
        })).isRequired,
        itemWidth: PropTypes.number,
        disabled: PropTypes.bool,
        onPress: PropTypes.func,
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
