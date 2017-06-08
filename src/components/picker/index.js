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
import { Form, InfoField } from 'components';
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
        items: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
        title: React.PropTypes.string.isRequired,
        onPress: React.PropTypes.func,
        hasNoBorder: React.PropTypes.bool,
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

    componentDidUpdate(prevProps, prevState) {
        if (this.props.cursor.get() && this.props.cursor.get() !== prevState.value) {
            this.setState({ // eslint-disable-line
                value: this.props.cursor.get(),
            });
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

        return (
            <InfoField
                title={title}
                text={cursor.get()}
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
