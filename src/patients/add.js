import React, { PropTypes } from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    ActivityIndicator,
    Alert,
    Button,
    StyleSheet,
    View,
} from 'react-native';
import { Input } from 'components';
import NavBar from 'components/nav-bar';
import schema from 'libs/state';

const model = {
    tree: {
        form: {
            firstname: '',
            lastname: '',
        },
        serverAnswer: { status: 'NotAsked' },
    },
};

export const AddPatient = schema(model)(React.createClass({
    propTypes: {
        navigator: PropTypes.object.isRequired,
        tree: BaobabPropTypes.cursor.isRequired,
        onPatientAdded: PropTypes.func.isRequired,
    },

    async submit() {
        const result = await this.props.createPatientService(
            this.props.tree.serverAnswer,
            this.props.tree.form.get());

        if (result.status === 'Failure') {
            Alert.alert(
                'Create Patient Error',
                JSON.stringify(result));
        } else {
            this.props.navigator.pop();
            this.props.onPatientAdded();
        }
    },

    render() {
        const firstNameCursor = this.props.tree.form.firstname;
        const lastNameCursor = this.props.tree.form.lastname;
        const status = this.props.tree.serverAnswer.status.get();
        const showLoader = status === 'Loading';

        return (
            <View>
                <NavBar
                    title="Create patient"
                    leftBtnTitle="Cancel"
                    rightBtnTitle="Create"
                    onLeftBtnPress={() => this.props.navigator.pop()}
                    onRightBtnPress={this.submit}
                />
                <View style={styles.container}>
                    <Input
                        label="First Name"
                        cursor={firstNameCursor}
                        inputWrapperStyle={styles.inputWrapperStyle}
                        inputStyle={styles.inputStyle}
                        placeholderTextColor="#ccc"
                        returnKeyType="next"
                    />
                    <Input
                        label="Last Name"
                        cursor={lastNameCursor}
                        inputWrapperStyle={styles.inputWrapperStyle}
                        inputStyle={styles.inputStyle}
                        placeholderTextColor="#ccc"
                        returnKeyType="next"
                    />
                </View>
                <ActivityIndicator
                    animating={showLoader}
                    size="large"
                    color="#FF3952"
                />
            </View>
        );
    },
}));

const styles = StyleSheet.create({
    container: {
        paddingTop: 20,
        paddingLeft: 30,
    },
    inputWrapperStyle: {
        borderBottomColor: '#ccc',
        marginBottom: 20,
    },
    inputStyle: {
        color: '#333',
    },
});

