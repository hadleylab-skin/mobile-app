import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {
    NavigatorIOS,
} from 'react-native';


export default createReactClass({
    displayName: 'MainNavigatorProvider',

    propTypes: NavigatorIOS.propTypes,

    childContextTypes: {
        mainNavigator: PropTypes.object.isRequired, // eslint-disable-line
    },

    getChildContext() {
        return {
            mainNavigator: this.mainNavigator || {},
        };
    },

    render() {
        return (
            <NavigatorIOS
                ref={(ref) => { this.mainNavigator = ref; }}
                {...this.props}
            />
        );
    },
});
