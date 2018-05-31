import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import BaobabPropTypes from 'baobab-prop-types';
import createReactClass from 'create-react-class';
import {
    View,
    Text,
    Image,
    TextInput,
    LayoutAnimation,
} from 'react-native';
import s from './styles';

import searchIcon from './images/search.png';

const Search = createReactClass({
    displayName: 'Search',

    propTypes: {
        searchCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        cursors: PropTypes.shape({
            patients: BaobabPropTypes.cursor.isRequired,
            filter: PropTypes.object.isRequired, // eslint-disable-line,
        }),
        services: PropTypes.shape({
            patientsService: PropTypes.func.isRequired,
        }),
    },

    getInitialState() {
        return {
            empty: true,
            isFocused: false,
        };
    },

    componentWillMount() {
        this.context.cursors.patients.on('update', this.searchPatients);
    },

    componentWillUnmount() {
        this.context.cursors.patients.off('update', this.searchPatients);
    },

    onChange(text) {
        const search = this.props.searchCursor;

        if (text) {
            this.setState({ empty: false });
        } else {
            this.setState({ empty: true });
        }

        search.set(text);
        this.searchPatients();
    },

    searchPatients() {
        const patientsCursor = this.context.cursors.patients;
        const patients = patientsCursor.get('data');
        const searchText = _.lowerCase(this.props.searchCursor.get());

        _.map(patients, (patient, key) => {
            const firstName = _.lowerCase(patient.data.firstName);
            const lastName = _.lowerCase(patient.data.lastName);
            const mrn = _.lowerCase(patient.data.mrn);
            const patientCursor = patientsCursor.select('data', key, 'data');

            if (firstName.indexOf(searchText) === -1 &&
                lastName.indexOf(searchText) === -1 &&
                mrn.indexOf(searchText) === -1) {
                patientCursor.select('hidden').set(true);
            } else {
                patientCursor.select('hidden').set(false);
            }
        });
    },

    onFocus() {
        LayoutAnimation.easeInEaseOut();
        this.setState({ isFocused: true });
    },

    onEndEditing() {
        LayoutAnimation.easeInEaseOut();
        this.setState({ isFocused: false });
    },

    render() {
        const { empty, isFocused } = this.state;
        const search = this.props.searchCursor;

        return (
            <View style={s.container}>
                <View
                    style={[
                        s.inputContainer,
                        { justifyContent: isFocused || !empty ? 'flex-start' : 'center' },
                    ]}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={searchIcon} />
                        {empty ?
                            <Text style={s.text}>Search Patients</Text>
                        : null}
                    </View>
                    <TextInput
                        value={search.get()}
                        onChangeText={this.onChange}
                        onEndEditing={this.onEndEditing}
                        onFocus={this.onFocus}
                        style={s.input}
                    />
                </View>
            </View>
        );
    },
});

export default Search;
