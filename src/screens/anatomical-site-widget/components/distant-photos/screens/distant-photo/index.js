import React from 'react';
import schema from 'libs/state';
import {
    View,
    Image,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import BaobabPropTypes from 'baobab-prop-types';
import { Button } from 'components';
import MolePicker from './components/mole-picker';
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

    contextTypes: {
        mainNavigator: React.PropTypes.object.isRequired, // eslint-disable-line
    },

    propTypes: {
        currentAnatomicalSite: React.PropTypes.string,
        onContinuePress: React.PropTypes.func.isRequired,
        moleCursor: BaobabPropTypes.cursor.isRequired,
    },

    getInitialState() {
        return {
            positionX: null,
            positionY: null,
        };
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

    onMolePick(positionX, positionY) {
        this.setState({ positionX, positionY });
    },

    render() {
        const { distantPhoto, pk } = this.props.tree.get();
        const { width, height } = this.props.tree.get('imageSize');
        const { positionX, positionY } = this.state;
        const { currentAnatomicalSite, moleCursor } = this.props;
        const isMoleLoading = moleCursor.get('status') === 'Loading';

        return (
            <View style={s.container}>
                <View style={[s.activityIndicator, { zIndex: isMoleLoading ? 2 : 0 }]}>
                    <ActivityIndicator
                        animating
                        size="large"
                        color="#FF1D70"
                    />
                </View>
                <MolePicker onMolePick={this.onMolePick}>
                    <Image
                        source={{ uri: distantPhoto.fullSize }}
                        resizeMode="contain"
                        style={{ width, height }}
                    />
                </MolePicker>
                <View style={s.footer}>
                    {positionX && positionY ?
                        <Button
                            type="rect"
                            title="Continue to close-up photo"
                            onPress={() => this.props.onContinuePress({
                                anatomicalSite: currentAnatomicalSite,
                                patientAnatomicalSite: pk,
                                positionX,
                                positionY,
                            })}
                        />
                    : null}
                </View>
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
        navigationBarHidden: false,
        leftButtonIcon: require('components/icons/back/back.png'),
        tintColor: '#FF2D55',
        passProps: props,
    };
}
