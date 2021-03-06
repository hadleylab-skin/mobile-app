import React from 'react';
import PropTypes from 'prop-types';
import BaobabPropTypes from 'baobab-prop-types';
import { View } from 'react-native';
import _ from 'lodash';
import services from 'services';

function initServices(token) {
    let initializedServices = {};

    _.each(services, (service, name) => {
        initializedServices[name] = service(token);
    });

    return initializedServices;
}

export class ServiceProvider extends React.Component {
    constructor(props) {
        super(props);
        this.services = initServices(props.token);
    }

    getChildContext() {
        return {
            services: this.services,
        };
    }

    render() {
        const { services, ...props } = this.props; // eslint-disable-line
        return (
            <View {...props} />
        );
    }
}

let servicesShape = {};

_.each(services, (service, name) => {
    servicesShape[name] = PropTypes.func.isRequired;
});

ServiceProvider.childContextTypes = {
    services: PropTypes.shape(servicesShape),
};

ServiceProvider.propTypes = {
    token: BaobabPropTypes.cursor.isRequired,
};
