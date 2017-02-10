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
import { Form } from '../form';
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
        onPress: React.PropTypes.func,
    },

    contextTypes: Form.childContextTypes,

    componentDidMount() {
        if (this.context.register) {
            this.context.register(this);
        }
    },

    onPress() {
        const { isOpen } = this.props.tree;

        if (!isOpen.get()) {
            this.props.onPress();
        }

        isOpen.apply((x) => !x);
    },

    focus() {
        this.props.tree.isOpen.set(true);
        this.props.onPress();
    },

    render() {
        const { cursor, items, title } = this.props;
        const { isOpen } = this.props.tree;
        const middleItemsValue = Math.floor(items.length / 2);

        return (
            <View style={s.container}>
                <TouchableWithoutFeedback
                    onPress={this.onPress}
                >
                    <View style={s.wrapper}>
                        <Text style={s.title}>{title}:</Text>
                        <Text style={s.text}>{items[cursor.get()]}</Text>
                    </View>
                </TouchableWithoutFeedback>
                {isOpen.get() ? (
                    <View style={s.picker}>
                        <PickerIOS
                            selectedValue={cursor.get() || cursor.get() === 0 ? cursor.get() : middleItemsValue}
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
                    </View>
                ) : null}
            </View>
        );
    },
}));
