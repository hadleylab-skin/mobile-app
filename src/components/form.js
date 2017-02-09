import React from 'react';
import { View } from 'react-native';

export class Form extends React.Component {
    constructor(props) {
        super(props);
        this.formItems = [];
    }

    getChildContext() {
        return {
            register: this.register.bind(this),
            next: this.next.bind(this),
            submit: this.props.onSubmit,
        };
    }

    register(ref) {
        return this.formItems.push(ref);
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
    onSubmit: React.PropTypes.func.isRequired,
};

Form.childContextTypes = {
    register: React.PropTypes.func,
    next: React.PropTypes.func,
    submit: React.PropTypes.func,
};
