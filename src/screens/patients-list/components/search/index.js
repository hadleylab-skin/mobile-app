import React from 'react';
import BaobabPropTypes from 'baobab-prop-types';
import {
    View,
    Text,
    Image,
    TextInput,
    LayoutAnimation,
} from 'react-native';
import s from './styles';

import searchIcon from './images/search.png';

const Search = React.createClass({
    displayName: 'Search',

    propTypes: {
        searchCursor: BaobabPropTypes.cursor.isRequired,
    },

    getInitialState() {
        return {
            empty: true,
            isFocused: false,
        };
    },

    onChange(text) {
        const search = this.props.searchCursor;

        if (text) {
            this.setState({ empty: false });
        } else {
            this.setState({ empty: true });
        }

        search.set(text);
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
