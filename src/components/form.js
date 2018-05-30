import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

export class Form extends React.Component {
    constructor(props) {
        super(props);
        this.formItems = [];
        this.namedItems = {};
    }

    getChildContext() {
        return {
            register: this.register.bind(this),
            next: this.next.bind(this),
            submit: this.props.onSubmit,
        };
    }

    register(ref, name) {
        if (name) {
            this.namedItems[name] = ref;
        }

        return this.formItems.push(ref);
    }

    getInput(name) {
        return this.namedItems[name];
    }

    next(index) {
        this.formItems[index].focus();
    }

    render() {
        const { onSubmit, ...props } = this.props; // eslint-disable-line
        return (
            <View {...props} />
        );
    }
}

Form.propTypes = {
    onSubmit: PropTypes.func.isRequired,
};

Form.childContextTypes = {
    register: PropTypes.func,
    next: PropTypes.func,
    submit: PropTypes.func,
};
