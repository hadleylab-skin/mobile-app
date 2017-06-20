import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    ActivityIndicator,
} from 'react-native';
import { Input, Form } from 'components';
import { convertCmToIn } from 'libs/misc';
import s from './styles';

const LesionsScreen = React.createClass({
    propTypes: {
        widthCursor: BaobabPropTypes.cursor.isRequired,
        heightCursor: BaobabPropTypes.cursor.isRequired,
        onSubmit: React.PropTypes.func.isRequired,
        width: React.PropTypes.string,
        height: React.PropTypes.string,
    },

    contextTypes: {
        user: BaobabPropTypes.cursor.isRequired,
    },

    getInitialState() {
        return {
            isLoading: false,
        };
    },

    componentWillMount() {
        this.context.user.on('update', this.update);
    },

    componentDidMount() {
        this.convertUnits();
    },

    componentWillUnmount() {
        this.context.user.off('update', this.update);
    },

    update() {
        this.forceUpdate();
        this.convertUnits();
    },

    convertUnits() {
        let width = this.props.width;
        let height = this.props.height;
        const unitsOfLength = this.context.user.get('unitsOfLength');

        if (width && height) {
            if (unitsOfLength === 'in') {
                width = convertCmToIn(width);
                height = convertCmToIn(height);
            } else {
                width = `${parseFloat(width).toFixed(2)}`;
                height = `${parseFloat(height).toFixed(2)}`;
            }
        }

        this.props.widthCursor.set(width);
        this.props.heightCursor.set(height);
    },

    onSubmit() {
        this.setState({ isLoading: true });
        this.props.onSubmit();
    },

    render() {
        const { widthCursor, heightCursor } = this.props;
        const unitsOfLength = this.context.user.get('unitsOfLength');

        return (
            <View style={s.container}>
                <View style={s.inner}>
                    <Form onSubmit={this.onSubmit}>
                        <Text style={s.label}>WIDTH ({unitsOfLength})</Text>
                        <Input
                            label={'width'}
                            cursor={widthCursor}
                            returnKeyType="next"
                            inputWrapperStyle={s.hasBottomBorder}
                            inputStyle={s.input}
                            placeholderTextColor="rgba(0,0,0,0.5)"
                        />
                        <Text style={s.label}>HEIGHT ({unitsOfLength})</Text>
                        <Input
                            label={'height'}
                            cursor={heightCursor}
                            returnKeyType="done"
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

export default LesionsScreen;
