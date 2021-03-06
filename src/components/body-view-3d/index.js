import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { requireNativeComponent, NativeEventEmitter, NativeModules } from 'react-native';
import s from './styles';

const BodyViewEventEmitter = NativeModules.BodyViewEventEmitter;
const eventEmitter = new NativeEventEmitter(BodyViewEventEmitter);
const NativeBodyView3D = requireNativeComponent('BodyView', BodyView3D);

export const BodyView3D = createReactClass({
    propTypes: {
        sex: PropTypes.oneOf(['male', 'female', 'child', 'cartoon-child']), // eslint-disable-line
        moles: PropTypes.array, // eslint-disable-line
        onBodyPartSelected: PropTypes.func,
        onMoleAdded: PropTypes.func,
        onMoleSelected: PropTypes.func,
        removeMole: PropTypes.bool,
    },

    componentWillMount() {
        eventEmitter.addListener('BodyPartSelectedEvent', this._onBodyPartSelected);
        eventEmitter.addListener('MoleAddedEvent', this._onMoleAdded);
        eventEmitter.addListener('MoleSelectedEvent', this._onMoleSelected);
    },

    componentWillUnmount() {
        eventEmitter.removeListener('BodyPartSelectedEvent', this._onBodyPartSelected);
        eventEmitter.removeListener('MoleAddedEvent', this._onMoleAdded);
        eventEmitter.removeListener('MoleSelectedEvent', this._onMoleSelected);
    },

    _onBodyPartSelected(data) {
        if (this.props.onBodyPartSelected) {
            this.props.onBodyPartSelected(data);
        }
    },

    _onMoleAdded(data) {
        if (this.props.onMoleAdded) {
            this.props.onMoleAdded(data);
        }
    },

    _onMoleSelected(data) {
        if (this.props.onMoleSelected) {
            this.props.onMoleSelected(data);
        }
    },

    render() {
        return (
            <NativeBodyView3D
                {...this.props}
                style={s.backgroundImage}
            />
        );
    },
});
