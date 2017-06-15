import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    ActivityIndicator,
} from 'react-native';
import { Input, Form } from 'components';
import s from './styles';

const DiagnosisScreen = React.createClass({
    propTypes: {
        cursor: BaobabPropTypes.cursor.isRequired,
        title: React.PropTypes.string.isRequired,
        onSubmit: React.PropTypes.func.isRequired,
        text: React.PropTypes.string,
    },

    getInitialState() {
        return {
            isLoading: false,
        };
    },

    componentDidMount() {
        this.props.cursor.set(this.props.text);
    },

    onSubmit() {
        this.setState({ isLoading: true });
        this.props.onSubmit();
    },

    render() {
        const { cursor, title } = this.props;

        return (
            <View style={s.container}>
                <View style={s.inner}>
                    <Form onSubmit={this.onSubmit}>
                        <Input
                            label={title}
                            cursor={cursor}
                            returnKeyType="done"
                            inputWrapperStyle={s.inputWrapper}
                            inputStyle={s.input}
                            placeholderTextColor="rgba(0,0,0,0.5)"
                        />
                    </Form>
                </View>
                <ActivityIndicator
                    animating={this.state.isLoading}
                    size="large"
                    color="#FF1D70"
                />
            </View>
        );
    },
});

export default DiagnosisScreen;
