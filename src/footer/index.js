import React from 'react';
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import schema from 'libs/state';
import { PatientList } from '../patients';
import Camera from '../camera';

const Footer = schema()(React.createClass({
    displayName: 'Footer',

    propTypes: {
        navigator: React.PropTypes.object,
    },

    getInitialState() {
        return {
            currentTab: 'camera',
        };
    },

    toPatientsList() {
        this.props.navigator.push({ component: PatientList, navigationBarHidden: true });
        this.setState({ currentTab: 'patients' });
    },

    toCamera() {
        this.props.navigator.push({ component: Camera, navigationBarHidden: true });
        this.setState({ currentTab: 'camera' });
    },

    render() {
        const { currentTab } = this.state;

        return (
            <View style={styles.footerWrapper}>
                <TouchableOpacity onPress={this.toCamera}>
                    <Image
                        source={require('./images/camera.png')}
                        style={[styles.image, {
                            tintColor: currentTab === 'camera' ? '#FF3952' : '#333',
                        }]}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={this.toPatientsList}>
                    <Image
                        source={require('./images/social.png')}
                        style={[styles.image, {
                            tintColor: currentTab === 'patients' ? '#FF3952' : '#333',
                        }]}
                    />
                </TouchableOpacity>
            </View>
        );
    },
}));

export default Footer;

const styles = StyleSheet.create({
    footerWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        height: 50,
        backgroundColor: '#fafafa',
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    image: {
        marginLeft: 30,
        marginRight: 30,
    },
});
