import React from 'react';
import { View } from 'react-native';
import _ from 'lodash';
import services from 'libs/services';


export class ServiceProvider extends React.Component {
    getChildContext() {
        return {
            services: this.props.services,
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
    servicesShape[name] = React.PropTypes.func.isRequired;
});

ServiceProvider.childContextTypes = {
    services: React.PropTypes.shape(servicesShape),
};

ServiceProvider.propTypes = {
    services: React.PropTypes.shape(servicesShape),
};
