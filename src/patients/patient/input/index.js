import React from 'react';
import { Input } from 'components';
import s from './styles';

const PatientInput = React.createClass({

    propTypes: {
        fullWidth: React.PropTypes.bool,
    },

    render() {
        const { fullWidth } = this.props;

        return (
            <Input
                inputWrapperStyle={[s.wrapper, fullWidth ? s.wrapperFull : {}]}
                inputStyle={s.input}
                errorStyle={s.error}
                {...this.props}
            />
        );
    },
});

export default PatientInput;
