import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {
    Text,
    View,
    TouchableHighlight,
} from 'react-native';
import s from './styles';

const CommonButton = createReactClass({
    propTypes: {
        title: PropTypes.string.isRequired,
        onPress: PropTypes.func.isRequired,
        underlayColor: PropTypes.string.isRequired,
        stylesButton: PropTypes.number,
        stylesText: PropTypes.number,
        disabled: PropTypes.bool,
    },

    onPress() {
        if (this.props.disabled) {
            return;
        }

        this.props.onPress();
    },

    render() {
        return (
            <TouchableHighlight
                disabled={this.props.disabled}
                style={[s.button, this.props.stylesButton || {}, this.props.disabled ? s.disabled : {}]}
                onPress={this.onPress}
                underlayColor={this.props.underlayColor}
            >
                <View>
                    <Text style={[s.text, this.props.stylesText || {}]}>
                        {this.props.title}
                    </Text>
                </View>
            </TouchableHighlight>
        );
    },
});

export const Button = createReactClass({
    propTypes: {
        type: PropTypes.string,
    },

    render() {
        const { type } = this.props;

        if (type === 'white') {
            return (
                <CommonButton
                    {...this.props}
                    stylesButton={s.whiteButton}
                    stylesText={s.whiteText}
                    underlayColor={'rgba(255,255,255,0.2)'}
                />
            );
        } else if (type === 'rect') {
            return (
                <CommonButton
                    {...this.props}
                    stylesButton={s.rectButton}
                    stylesText={s.rectText}
                    underlayColor={'rgba(252,49,89,0.5)'}
                />
            );
        } else if (type === 'green') {
            return (
                <CommonButton
                    {...this.props}
                    stylesButton={s.greenButton}
                    stylesText={s.rectText}
                    underlayColor={'rgba(63,195,0,0.5)'}
                />
            );
        }

        return (
            <CommonButton
                {...this.props}
                stylesButton={s.pinkButton}
                stylesText={s.pinkText}
                underlayColor={'rgba(252,49,89,0.2)'}
            />
        );
    },
});
