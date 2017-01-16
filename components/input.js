import React from 'react';
import {
    Text,
    View,
    TextInput,
} from 'react-native';
import schema from 'libs/state';

function model({ defaultValue }) {
    return {
        cursor: (c) => c.set(defaultValue),
    };
}

export const Input = schema(model)(({ cursor }) => (
    <View>
        <Text>{cursor.get()}</Text>
        <TextInput
            style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
            onChangeText={(text) => cursor.set(text)}
            value={cursor.get()}
        />
    </View>
    )
);

