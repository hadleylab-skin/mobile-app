import React from 'react';
import {
    View,
    StyleSheet,
    TextInput,
} from 'react-native';
import schema from 'libs/state';

function model({ defaultValue }) {
    return {
        cursor: (c) => c.set(defaultValue),
    };
}

export const Input = schema(model)(({ label, cursor, ...props }) => (
    <View style={styles.container}>
        <TextInput
            style={styles.input}
            placeholder={label}
            onChangeText={(text) => cursor.set(text)}
            placeholderTextColor="#fff"
            value={cursor.get()}
            {...props}
        />
    </View>
    )
);

const styles = StyleSheet.create({
    container: {
        borderBottomColor: '#fff',
        borderBottomWidth: 1,
        marginBottom: 35,
    },
    input: {
        height: 30,
        width: 250,
        color: '#fff',
    },
});

