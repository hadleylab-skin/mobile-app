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
        theme: PropTypes.string,
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

    getThemeColors() {
        const { theme } = this.props;

        if (theme === 'white') {
            return {
                mainColor: '#FFFFFF',
                auxiliaryColor: '#FF1D70',
            };
        }

        return {
            mainColor: '#ACB5BE',
            auxiliaryColor: '#FFFFFF',
        };
    },

    render() {
        const { items, itemWidth, disabled } = this.props;
        const currentValue = this.props.cursor.get();
        const { mainColor, auxiliaryColor } = this.getThemeColors();

        return (
            <View style={[s.container, { borderColor: mainColor }, disabled ? s.containerDisabled : {}]}>
                {_.map(items, (item, index) => (
                    <TouchableWithoutFeedback
                        key={`switch-${index}`}
                        onPress={() => this.onPress(item.value)}
                    >
                        <View
                            style={[
                                s.item,
                                { backgroundColor: item.value === currentValue ?  mainColor : 'transparent' },
                                itemWidth ? { width: itemWidth } : {},
                            ]}
                        >
                            <Text
                                style={[s.text, { color: item.value === currentValue ? auxiliaryColor : mainColor }]}
                            >{item.label}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                ))}
            </View>
        );
    },
});
