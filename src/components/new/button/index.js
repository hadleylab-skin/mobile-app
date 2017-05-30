import React from 'react';
import {
    Text,
    View,
    TouchableHighlight,
} from 'react-native';
import s from './styles';

class CommonButton extends React.Component {
    render() {
        return (
            <TouchableHighlight
                style={[s.button, this.props.stylesButton || {}]}
                onPress={this.props.onPress}
                underlayColor={this.props.underlayColor}
            >
                <View>
                    <Text style={[s.text, this.props.stylesText || {}]}>
                        {this.props.title}
                    </Text>
                </View>
            </TouchableHighlight>
        );
    }
}

CommonButton.propTypes = {
    title: React.PropTypes.string.isRequired,
    onPress: React.PropTypes.func.isRequired,
    underlayColor: React.PropTypes.string.isRequired,
    stylesButton: React.PropTypes.number,
    stylesText: React.PropTypes.number,
};

export class Button extends React.Component {
    render() {
        const { type } = this.props;

        if (type === 'white') {
            return (
                <CommonButton
                    {...this.props}
                    stylesButton={s.whiteButtton}
                    stylesText={s.whiteText}
                    underlayColor={'rgba(255,255,255,0.2)'}
                />
            );
        } else if (type === 'rect') {
            return (
                <CommonButton
                    {...this.props}
                    stylesButton={s.rectButtton}
                    stylesText={s.rectText}
                    underlayColor={'rgba(252,49,89,0.5)'}
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
    }
}

Button.propTypes = {
    type: React.PropTypes.string,
};

