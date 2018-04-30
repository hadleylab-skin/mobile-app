import React from 'react';
import {
    NavigatorIOS,
} from 'react-native';


export default React.createClass({
    displayName: 'MainNavigatorProvider',

    propTypes: NavigatorIOS.propTypes,

    childContextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
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
