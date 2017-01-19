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
            <View style={styles.container}>
                <Input label="First Name" cursor={firstNameCursor} returnKeyType="next" />
                <Input label="Last Name" cursor={lastNameCursor} returnKeyType="next" />
                {
                    showLoader
                    ?
                        <ActivityIndicator />
                    :
                        <Button title="Add patient" onPress={this.submit} />
                }
            </View>
        );
    },
}));

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF3952',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 50,
    },
});

