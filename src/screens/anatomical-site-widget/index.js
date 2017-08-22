import React from 'react';
import { BodyView3D } from 'components';
import schema from 'libs/state';

export const AnatomicalSiteWidget = schema({})(React.createClass({
    displayName: 'AnatomicalSiteWidget',

    render() {
        const sex = 'male';
        const moles = ['a', 'b'];

        return (
            <BodyView3D
                sex={sex}
                moles={moles}
                onBodyPartSelected={(data) => console.log('onBodyPartSelected', data)}
                onMoleAdded={(data) => console.log('onMoleAdded', data)}
                onMoleSelected={(data) => console.log('onMoleSelected', data)}
            />
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
