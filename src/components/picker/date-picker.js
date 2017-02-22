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
import { Form } from '../form';
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
    },

    contextTypes: Form.childContextTypes,

    getInitialState() {
        return {
            value: new Date(this.props.cursor.get()),
        };
    },

    componentDidMount() {
        if (this.context.register) {
            this.context.register(this);
        }
    },

    componentDidUpdate(prevProps, prevState) {
        const newDate = new Date(this.props.cursor.get());
        if (!moment(newDate).isSame(moment(prevState.value))) {
            this.setState({ // eslint-disable-line
                value: newDate,
            });
        }
    },

    onValueChange(value) {
        this.setState({ value });
        this.props.cursor.set(moment(value).format('YYYY-MM-DD'));
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
        const { cursor, title } = this.props;
        const { isOpen } = this.props.tree;

        return (
            <View style={s.container}>
                <TouchableWithoutFeedback onPress={this.onPress}>
                    <View style={s.wrapper}>
                        <Text style={s.title}>{title}:</Text>
                        <Text style={s.text}>
                            {cursor.get() ? moment(cursor.get()).format('DD MMM YYYY') : null}
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
                {isOpen.get() ? (
                    <View style={s.picker}>
                        <DatePickerIOS
                            date={this.state.value}
                            mode="date"
                            onDateChange={this.onValueChange}
                            maximumDate={new Date()}
                        />
                    </View>
                ) : null}
            </View>
        );
    },
}));
