import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import _ from 'lodash';
import {
    View,
    Text,
    PickerIOS,
    TouchableWithoutFeedback,
} from 'react-native';
import schema from 'libs/state';
import s from './styles';

const model = {
    tree: {
        isOpen: false,
    },
};

export const Picker = schema(model)(React.createClass({
    displayName: 'Picker',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
        items: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        title: React.PropTypes.string.isRequired,
    },

    onPress() {
        const { isOpen } = this.props.tree;

        if (!isOpen.get()) {
            this.props.onPress();
        }

        isOpen.apply((x) => !x);
    },

    render() {
        const { cursor, items, title } = this.props;
        const { isOpen } = this.props.tree;

        return (
            <View style={s.container}>
                <TouchableWithoutFeedback
                    onPress={this.onPress}
                >
                    <View style={s.inputWrapperStyle}>
                        <Text style={[s.groupTitle, { paddingTop: 7, paddingBottom: 8 }]}>{title}:</Text>
                        <Text style={s.groupText}>{items[cursor.get()]}</Text>
                    </View>
                </TouchableWithoutFeedback>
                {isOpen.get() ? (
                    <PickerIOS
                        selectedValue={cursor.get()}
                        onValueChange={(index) => cursor.set(index)}
                    >
                        {_.map(items, (label, index) => (
                            <PickerIOS.Item
                                key={index}
                                value={index}
                                label={label}
                            />
                        ))}
                    </PickerIOS>
                ) : null}
            </View>
        );
    },
}));
