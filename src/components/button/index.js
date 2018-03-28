import React from 'react';
import {
    Text,
    View,
    TouchableHighlight,
} from 'react-native';
import s from './styles';

const CommonButton = React.createClass({
    propTypes: {
        title: React.PropTypes.string.isRequired,
        onPress: React.PropTypes.func.isRequired,
        underlayColor: React.PropTypes.string.isRequired,
        stylesButton: React.PropTypes.number,
        stylesText: React.PropTypes.number,
        disabled: React.PropTypes.bool,
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

export const Button = React.createClass({
    propTypes: {
        type: React.PropTypes.string,
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
                stylesButton={s.pinkButtton}
                stylesText={s.pinkText}
                underlayColor={'rgba(252,49,89,0.2)'}
            />
        );
    },
});
