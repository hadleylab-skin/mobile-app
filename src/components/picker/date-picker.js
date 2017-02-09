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

    onPress() {
        const { isOpen } = this.props.tree;

        if (!isOpen.get()) {
            this.props.onPress();
        }

        isOpen.apply((x) => !x);
    },

    render() {
        const { cursor, title } = this.props;
        const { isOpen } = this.props.tree;

        return (
            <View style={s.container}>
                <TouchableWithoutFeedback
                    onPress={this.onPress}
                >
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
                            date={cursor.get() ? cursor.get() : new Date()}
                            mode="date"
                            onDateChange={(date) => cursor.set(date)}
                        />
                    </View>
                ) : null}
            </View>
        );
    },
}));
