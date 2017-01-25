import React from 'react';
import {
    View,
    StyleSheet,
    TabBarIOS,
} from 'react-native';
import { PatientList } from '../patients';
import Camera from '../camera';

export default React.createClass({
    displayName: 'Footer',

    propTypes: {
        navigator: React.PropTypes.object,
        currentTab: React.PropTypes.string,
    },

    toPatientsList() {
        this.props.navigator.push({ component: PatientList, navigationBarHidden: true });
    },

    toCamera() {
        this.props.navigator.push({ component: Camera, navigationBarHidden: true });
    },

    render() {
        const { currentTab } = this.props;

        return (
            <TabBarIOS
                barTintColor="#fafafa"
                tintColor="#FF3952"
                unselectedItemTintColor="#333"
                style={styles.footerWrapper}>
                <TabBarIOS.Item
                    title="Camera"
                    icon={require('./images/camera.png')}
                    selected={currentTab === 'camera'}
                    onPress={this.toCamera}
                ><View /></TabBarIOS.Item>
                <TabBarIOS.Item
                    title="Patients"
                    icon={require('./images/social.png')}
                    selected={currentTab === 'patients'}
                    onPress={this.toPatientsList}
                ><View /></TabBarIOS.Item>
            </TabBarIOS>
        );
    },
});

const styles = StyleSheet.create({
    footerWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 50,
        zIndex: 1,
    },
    image: {
        marginLeft: 30,
        marginRight: 30,
    },
});
