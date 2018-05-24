import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import _ from 'lodash';
import {
    View,
    Text,
    PickerIOS,
    TouchableWithoutFeedback,
} from 'react-native';
import schema from 'libs/state';
import { Form, InfoField } from 'components';
import s from './styles';

const model = {
    tree: {
        isOpen: false,
    },
};

export const Picker = schema(model)(createReactClass({
    displayName: 'Picker',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
        items: PropTypes.arrayOf(PropTypes.array),
        title: PropTypes.string.isRequired,
        onPress: PropTypes.func,
        hasNoBorder: PropTypes.bool,
    },

    // contextTypes: Form.childContextTypes,

    getInitialState() {
        const middleItemsValue = Math.floor(this.props.items.length / 2);
        const selectedValue = this.props.cursor.get() || this.props.items[middleItemsValue][0];

        return {
            value: selectedValue,
        };
    },

    componentDidMount() {
        // if (this.context.register) {
            // this.context.register(this);
        // }
    },

    onPress() {
        const { isOpen } = this.props.tree;

        if (!isOpen.get() && this.props.onPress) {
            this.props.onPress();
        }

        isOpen.apply((x) => !x);
    },

    focus() {
        this.props.tree.isOpen.set(true);
        this.props.onPress();
    },

    onValueChange(value) {
        this.setState({ value });
    },

    onSubmit() {
        this.props.cursor.set(this.state.value);
        this.props.tree.isOpen.set(false);
    },

    render() {
        const { cursor, items, title } = this.props;
        const { isOpen } = this.props.tree;

        const itemsObject = _.fromPairs(items);

        return (
            <InfoField
                title={title}
                text={itemsObject[cursor.get()]}
                onPress={this.onPress}
                hasNoBorder={this.props.hasNoBorder}
            >
                {isOpen.get() ? (
                    <View style={s.picker}>
                        <TouchableWithoutFeedback onPress={this.onSubmit}>
                            <View style={s.submitWrapper}>
                                <Text style={s.submitText}>Done</Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <PickerIOS
                            selectedValue={this.state.value}
                            onValueChange={this.onValueChange}
                        >
                            {_.map(items, (label) => (
                                <PickerIOS.Item
                                    key={label[0]}
                                    value={label[0]}
                                    label={label[1]}
                                />
                            ))}
                        </PickerIOS>
                    </View>
                ) : null}
            </InfoField>
        );
    },
}));
