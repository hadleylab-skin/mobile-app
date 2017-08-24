import React from 'react';
import schema from 'libs/state';
import {
    View,
    Image,
    Dimensions,
} from 'react-native';
import s from './styles';

const model = {
    tree: {
        imageSize: {
            width: 0,
            height: 0,
        },
    },
};

const DistantPhoto = schema(model)(React.createClass({
    displayName: 'DistantPhoto',

    propTypes: {
    },

    componentDidMount() {
        const photo = this.props.tree.distantPhoto.fullSize.get();

        this.getImageSize(photo);
    },

    getImageSize(photo) {
        const windowWidth = Dimensions.get('window').width;

        Image.getSize(photo, (photoWidth, photoHeight) => {
            const width = windowWidth;
            const height = (width / photoWidth) * photoHeight;

            this.props.tree.select('imageSize').set({ width, height });
        });
    },

    render() {
        const { distantPhoto } = this.props.tree.get();
        const { width, height } = this.props.tree.get('imageSize');

        return (
            <View style={s.container}>
                <Image
                    source={{ uri: distantPhoto.fullSize }}
                    resizeMode="contain"
                    style={{ width, height }}
                />
            </View>
        );
    },
}));

export function getDistantPhotoRoute(props, context) {
    return {
        component: DistantPhoto,
        title: 'Add Lesion',
        onLeftButtonPress: () => {
            if (props.onBackPress) {
                props.onBackPress();

                return;
            }

            context.mainNavigator.pop();
        },
        onRightButtonPress: () => console.log('Done pressed'),
        navigationBarHidden: false,
        rightButtonTitle: 'Done',
        leftButtonIcon: require('components/icons/back/back.png'),
        tintColor: '#FF2D55',
        passProps: props,
    };
}
