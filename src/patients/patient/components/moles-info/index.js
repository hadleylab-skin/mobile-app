import React from 'react';
import {
    View,
    Text,
} from 'react-native';
import { Button } from 'components/new/button';
import s from './styles';

export const MolesInfo = React.createClass({
    propTypes: {},

    render() {
        const moles = 20;
        const benign = 20;
        const malignant = 2;

        return (
            <View style={s.container}>
                {moles ?
                    <View style={s.moles}>
                        <Text style={s.text}>
                            {moles === 1 ? ' mole: ' : ' moles: '}
                            {benign ?
                                <Text>
                                    {benign} benign
                                    {', '}
                                </Text>
                            : null}
                            {malignant ?
                                <Text>{malignant} malignant</Text>
                            : null}
                        </Text>
                    </View>
                : null}
                <Button
                    title="Add a new mole"
                    onPress={() => console.log('Add a new mole')}
                />
            </View>
        );
    },
});
