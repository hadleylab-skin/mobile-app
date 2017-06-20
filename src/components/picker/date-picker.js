import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    DatePickerIOS,
    TouchableWithoutFeedback,
} from 'react-native';
import schema from 'libs/state';
import moment from 'moment';
import { Form, InfoField } from 'components';
import s from './styles';

const model = {
    tree: {
        isOpen: false,
    },
};

export const DatePicker = schema(model)(React.createClass({
    displayName: 'DatePicker',

    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
        title: React.PropTypes.string.isRequired,
        onPress: React.PropTypes.func,
        hasNoBorder: React.PropTypes.bool,
    },

    // contextTypes: Form.childContextTypes,

    getInitialState() {
        return {
            value: new Date(this.props.cursor.get()),
        };
    },

    componentDidMount() {
        /*if (this.context.register) {
            this.context.register(this);
        }*/
    },

    onValueChange(value) {
        this.setState({ value });
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

    onSubmit() {
        this.props.cursor.set(moment(this.state.value).format('YYYY-MM-DD'));
        this.props.tree.isOpen.set(false);
    },

    render() {
        const { cursor, title } = this.props;
        const { isOpen } = this.props.tree;
        const date = cursor.get();
        const text = date ? `${moment(date).format('MMM DD')}, ${moment(date).format('YYYY')}` : null;

        return (
            <InfoField
                title={title}
                text={text}
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
                        <DatePickerIOS
                            date={this.state.value}
                            mode="date"
                            onDateChange={this.onValueChange}
                            maximumDate={new Date()}
                        />
                    </View>
                ) : null}
            </InfoField>
        );
    },
}));
