import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import BaobabPropTypes from 'baobab-prop-types';
import { ServiceProvider } from 'components';
import { CryptoConfiguration } from 'screens/crypto-config';
import Main from './main';
import MainNavigatorProvider from './main-navigator-provider';


export default createReactClass({
    displayName: 'MainNavigator',

    propTypes: {
        tree: BaobabPropTypes.cursor.isRequired,
        tokenCursor: BaobabPropTypes.cursor.isRequired,
        keyPairStatusCursor: BaobabPropTypes.cursor.isRequired,
    },

    childContextTypes: {
        cursors: PropTypes.shape({
            doctor: BaobabPropTypes.cursor.isRequired,
            patients: BaobabPropTypes.cursor.isRequired,
            patientsMoles: BaobabPropTypes.cursor.isRequired,
            patientsMoleImages: BaobabPropTypes.cursor.isRequired,
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            currentStudyPk: BaobabPropTypes.cursor.isRequired,
            racesList: BaobabPropTypes.cursor.isRequired,
            filter: PropTypes.object.isRequired, // eslint-disable-line
        }),
    },

    getChildContext() {
        return {
            cursors: {
                doctor: this.props.tokenCursor.data.doctor.data,
                patients: this.props.tree.patients,
                patientsMoles: this.props.tree.patientsMoles,
                patientsMoleImages: this.props.tree.patientsMoleImages,
                currentPatientPk: this.props.tree.currentPatientPk,
                currentStudyPk: this.props.tree.currentStudyPk,
                racesList: this.props.tree.racesList,
                filter: this.props.tree.filter,
            },
        };
    },

    componentWillMount() {
        this.props.tree.set('cryptoScreen', {});
    },

    renderContent() {
        const keyPairStatusCursor = this.props.keyPairStatusCursor;
        let { status, data } = keyPairStatusCursor.get();
        if (status === 'Loading' || !data) {
            return null;
        }

        const { publicKey, privateKey } = data;
        if (!publicKey && !privateKey) {
            // If no keys on device, need init it!
            status = 'NeedCreateKeys';
        }

        if (status === 'Succeed') {
            return (
                <MainNavigatorProvider
                    initialRoute={{
                        component: Main,
                        title: 'Patients',
                        navigationBarHidden: true,
                        tintColor: '#FF2D55',
                        passProps: this.props,
                    }}
                    style={{ flex: 1 }}
                    barTintColor="#fff"
                />
            );
        } else {
            return (
                <CryptoConfiguration
                    tree={this.props.tree.cryptoScreen}
                    doctorCursor={this.props.tokenCursor.data.doctor}
                    keyPairStatusCursor={keyPairStatusCursor}
                />
            );
        }
    },

    render() {
        return (
            <ServiceProvider
                token={this.props.tokenCursor.data}
                style={{ flex: 1 }}
            >
                {this.renderContent()}
            </ServiceProvider>
        );
    },
});
