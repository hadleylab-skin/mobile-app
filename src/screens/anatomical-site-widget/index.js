import React from 'react';
import {
    View,
} from 'react-native';
import { BodyView3D } from 'components';
import ImagePicker from 'react-native-image-picker';
import BaobabPropTypes from 'baobab-prop-types';
import schema from 'libs/state';

const model = {
    tree: {},
};

export const AnatomicalSiteWidget = schema(model)(React.createClass({
    displayName: 'AnatomicalSiteWidget',

    contextTypes: {
        cursors: React.PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
        }),
        services: React.PropTypes.shape({
            addMoleService: React.PropTypes.func.isRequired,
        }),
    },

    onMoleAdded(data) {
        console.log('onMoleAdded', data);

        ImagePicker.launchCamera({}, (response) => {
            if (response.uri) {
                this.onSubmitMolePhoto(data, response.uri);
            }
        });
    },

    async onSubmitMolePhoto(data, uri) {
        const moleData = {
            anatomicalSite: data.bodyPart,
            positionX: data.x,
            positionY: data.y,
            uri,
        };

        console.log('moleData', moleData);

        /*const service = this.context.services.addMoleService;
        const patientPk = this.context.cursors.currentPatientPk.get();
        const result = await service(patientPk, this.props.tree.mole, moleData);

        if (result.status === 'Succeed') {
            this.onMoleAddedSuccessfully();
            this.props.onAddingComplete();
        }*/
    },

    render() {
        const sex = 'female';
        const moles = ['a', 'b'];

        return (
            <View style={{ flex: 1, paddingTop: 64 }}>
                <BodyView3D
                    sex={sex}
                    moles={moles}
                    onBodyPartSelected={(data) => console.log('onBodyPartSelected', data)}
                    onMoleAdded={this.onMoleAdded}
                    onMoleSelected={(data) => console.log('onMoleAdded', data)}
                />
            </View>
        );
    },
}));

export function getAnatomicalSiteWidgetRoute({ title, ...props }, context) {
    return {
        component: AnatomicalSiteWidget,
        title: title || 'Add photo',
        onLeftButtonPress: () => {
            if (props.onBackPress) {
                props.onBackPress();

                return;
            }

            context.mainNavigator.pop();
        },
        onRightButtonPress: () => {
            if (props.onBackPress) {
                props.onBackPress();

                return;
            }

            context.mainNavigator.pop();
        },
        navigationBarHidden: false,
        rightButtonTitle: 'Cancel',
        leftButtonIcon: require('components/icons/back/back.png'),
        tintColor: '#FF2D55',
        passProps: props,
    };
}
