import React from 'react';
import _ from 'lodash';
import schema from 'libs/state';
import {
    View,
    Image,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import BaobabPropTypes from 'baobab-prop-types';
import { Button } from 'components';
import dotImage from 'components/icons/dot/dot.png';
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

    propTypes: {
        currentAnatomicalSite: React.PropTypes.string,
        onContinuePress: React.PropTypes.func.isRequired,
        moleCursor: BaobabPropTypes.cursor.isRequired,
    },

    contextTypes: {
        cursors: React.PropTypes.shape({
            currentPatientPk: BaobabPropTypes.cursor.isRequired,
            patientsMoles: React.PropTypes.object.isRequired, // eslint-disable-line
        }),
    },

    getInitialState() {
        return {
            positionX: null,
            positionY: null,
            isLoading: false,
        };
    },

    async componentWillMount() {
        const { moleCursor } = this.props;
        const patientMolesCursor = this.getPatientMolesCursor();

        patientMolesCursor.on('update', this.onPatientsMolesUpdate);
        moleCursor.on('update', this.onMoleUpdate);
    },

    componentDidMount() {
        const photo = this.props.tree.distantPhoto.fullSize.get();

        this.getImageSize(photo);
    },

    componentWillUnmount() {
        const { moleCursor } = this.props;
        const patientMolesCursor = this.getPatientMolesCursor();

        patientMolesCursor.off('update', this.onPatientsMolesUpdate);
        moleCursor.off('update', this.onMoleUpdate);
    },

    getPatientMolesCursor() {
        const { cursors } = this.context;
        const patientPk = cursors.currentPatientPk.get();
        const patientMolesCursor = cursors.patientsMoles.select(patientPk, 'moles');

        return patientMolesCursor;
    },

    onPatientsMolesUpdate() {
        this.forceUpdate();

        const patientMolesCursor = this.getPatientMolesCursor();
        const patientMoles = patientMolesCursor.get();

        if (patientMoles.status === 'Succeed') {
            this.setState({ positionX: null, positionY: null, isLoading: false });
        }
    },

    onMoleUpdate() {
        const mole = this.props.moleCursor.get();

        if (mole.status === 'Loading') {
            this.setState({ isLoading: true });
        }
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

    getMoles() {
        const patientMolesCursor = this.getPatientMolesCursor();
        const patientMoles = patientMolesCursor.get('data');

        const moles = _.groupBy(patientMoles, (mole) => {
            const anatomicalSitesLength = mole.data.anatomicalSites.length;
            const anatomicalSite = mole.data.anatomicalSites[anatomicalSitesLength - 1];

            return anatomicalSite.pk;
        });

        return moles;
    },

    onContinuePress() {
        const { positionX, positionY } = this.state;
        const { currentAnatomicalSite } = this.props;
        const { pk } = this.props.tree.get();

        this.props.onContinuePress({
            anatomicalSite: currentAnatomicalSite,
            patientAnatomicalSite: pk,
            positionX,
            positionY,
        });
    },

    render() {
        const { distantPhoto, pk } = this.props.tree.get();
        const { width, height } = this.props.tree.get('imageSize');
        const { positionX, positionY, isLoading } = this.state;
        const { currentAnatomicalSite } = this.props;

        const moles = this.getMoles();
        const currentAnatomicalSiteMoles = moles[currentAnatomicalSite] || [];

        return (
            <View style={s.container}>
                <View style={[s.activityIndicator, { zIndex: isLoading ? 2 : 0 }]}>
                    <ActivityIndicator
                        animating
                        size="large"
                        color="#FF1D70"
                    />
                </View>
                <MolePicker
                    onMolePick={this.onMolePick}
                    positionX={positionX}
                    positionY={positionY}
                >
                    <Image
                        source={{ uri: distantPhoto.fullSize }}
                        resizeMode="contain"
                        style={{ width, height }}
                    />
                    {_.map(currentAnatomicalSiteMoles, (mole, index) => {
                        const { x: left, y: top } = mole.data.positionInfo;

                        if (mole.data.patientAnatomicalSite !== pk) {
                            return null;
                        }

                        return (
                            <Image
                                key={index}
                                source={dotImage}
                                style={[s.dot, { left, top }]}
                            />
                        );
                    })}
                </MolePicker>

                <View style={s.footer}>
                    {positionX && positionY ?
                        <Button
                            type="rect"
                            title="Continue to close-up photo"
                            onPress={this.onContinuePress}
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
